const {
  existsSync,
  renameSync,
  rmdirSync,
  statSync,
  symlinkSync,
  unlinkSync,
} = require('fs')
const {
  join,
} = require('path')

const chalk = require('chalk')
const figlet = require('figlet')
const inquirer = require('inquirer')

const config = require('./dotfiles.json')

class FS {
  constructor() {
    this.actions = [];
    this.prompt = inquirer.prompt;
  }

  symlink(source, destination) {
    this.actions.push({
      type: 'link',
      source,
      destination,
    });
  }

  async commit() {
    let answers = {
      action: null,
      all: false,
    };

    for (let action of this.actions) {
      if (existsSync(action.destination)) {
        if (!answers.all) {
          answers = await this.prompt([
            {
              type: 'list',
              name: 'action',
              message: `File or directory already exists: ${action.destination}\n  What would you like to do?`,
              choices: [
                {
                  key: 's',
                  name: 'Skip',
                  value: 'skip',
                },
                {
                  key: 'o',
                  name: 'Overwrite',
                  value: 'overwrite',
                },
                {
                  key: 'b',
                  name: 'Backup',
                  value: 'backup',
                },
              ],
            },
            {
              type: 'confirm',
              name: 'all',
              message: 'Do this action for all?',
              default: false,
            },
          ]);
        }

        switch (answers.action) {
          case 'skip': continue;
          case 'backup': {
            renameSync(
              action.destination,
              action.destination + '.bak'
            );
            break;
          }
          case 'overwrite': {
            const stats = statSync(action.destination);
            const deleteSync = stats.isDirectory() ? rmdirSync : unlinkSync;

            deleteSync(action.destination);
            break;
          }
        }
      }

      console.log(JSON.stringify({ action, answers }, null, 2));

      switch (action.type) {
        case 'link': {
          symlinkSync(
            action.source,
            action.destination,
          );
          break;
        }
      }
    }
  }
}

class Dotfiles {
  constructor() {
    this.source = process.cwd();
    this.destination = process.env.HOME;
    this.fs = new FS();
  }

  sourcePath(...segments) {
    return join(this.source, ...segments);
  }

  destinationPath(...segments) {
    return join(this.destination, ...segments);
  }

  async shells(shells) {
    for (let shell of shells) {
      switch (shell) {
        case 'bash': {
          await this.fs.symlink(
            this.sourcePath(shell, 'rc.sh'),
            this.destinationPath('.bashrc'),
          );
          break;
        }
        case 'zsh': {
          await this.fs.symlink(
            this.sourcePath(shell, 'rc.zsh'),
            this.destinationPath('.zshrc'),
          );
          break;
        }
        case 'fish': {
          await this.fs.symlink(
            this.sourcePath(shell),
            this.destinationPath('.config', 'fish'),
          );
          break;
        }
      }
    }
  }

  async editors(editors) {
    for (let editor of editors) {
    }
  }

  async frameworks(frameworks) {
    for (let framework of frameworks) {
    }
  }

  async run() {
    console.log(
      chalk.blue(
        figlet.textSync(
          'Dotfiles',
          {
            font: 'Block',
            horizontalLayout: 'default',
            verticalLayout: 'default',
          },
        ),
      ),
    );

    for (let [key, value] of Object.entries(config)) {
      if (['name', 'email'].includes(key)) {
        continue;
      }

      await this[key](value);
    }

    await this.fs.commit();
  }
}

const dotfiles = new Dotfiles();

dotfiles.run();
