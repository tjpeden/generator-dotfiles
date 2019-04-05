"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  async prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the well-made ${chalk.red("generator-dotfiles")} generator!`
      )
    );

    const prompts = [
      {
        type: "input",
        name: "name",
        message: "What is your name?",
        store: true
      },
      {
        type: "input",
        name: "email",
        message: "What is your email?",
        store: true
      },
      {
        type: "checkbox",
        name: "shells",
        message: "Which shell(s) do you use?",
        choices: [
          { name: "Bash", value: "bash", checked: true },
          { name: "Fish", value: "fish" },
          { name: "Zsh", value: "zsh" }
        ],
        store: true
      },
      {
        type: "checkbox",
        name: "editors",
        message: "Which editor(s) do you use?",
        choices: [
          { name: "Visual Studio Code", value: "code", checked: true },
          { name: "Atom", value: "atom" }
        ],
        store: true
      },
      {
        type: "checkbox",
        name: "frameworks",
        message: "Which shell framework(s) do you use?",
        choices: [{ name: "Oh My Zsh", value: "oh-my-zsh" }],
        store: true
      }
    ];

    this.props = await this.prompt(prompts);
  }

  writing() {
    this.destinationRoot(this.destinationPath("dotfiles"));

    this.fs.copyTpl(
      this.templatePath("package.json"),
      this.destinationPath("package.json"),
      this.props
    );

    this.fs.copy(
      this.templatePath("index.js"),
      this.destinationPath("index.js")
    );

    this.sourceRoot(process.env.HOME);

    for (const shell of this.props.shells) {
      switch (shell) {
        case "bash": {
          this.fs.copy(
            this.templatePath(".bashrc"),
            this.destinationPath("bash", "rc.sh")
          );
          break;
        }
        case "fish": {
          this.fs.copy(
            this.templatePath(".config", "fish"),
            this.destinationPath("fish")
          );
          break;
        }
        case "zsh": {
          this.fs.copy(
            this.templatePath(".zshrc"),
            this.destinationPath("zsh", "rc.zsh")
          );
          break;
        }
        default: {
          throw new Error("This should NEVER be thrown!");
        }
      }
    }

    for (const editor of this.props.editors) {
      switch (editor) {
        case "code": {
          this.fs.copy(
            this.templatePath(
              "Library",
              "Application Support",
              "Code",
              "User",
              "{*.json,snippets}",
              "*"
            ),
            this.destinationPath("vscode")
          );
          break;
        }
        case "atom": {
          this.fs.copy(
            this.templatePath(".atom", "*"),
            this.destinationPath("atom")
          );
          break;
        }
        default: {
          throw new Error("This should NEVER be thrown!");
        }
      }
    }

    this.fs.writeJSON(this.destinationPath("props.json"), this.props);
  }
};
