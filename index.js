const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const inquirer = require('inquirer');
const globby = require('globby');
const slash = require('slash');

module.exports = (api, options) => {
  api.registerCommand('comp', args => {
    const createComp = new CreateComp(api, options);
    createComp.init();
  });
};

class CreateComp {
  constructor(api, options) {
    this.componentName = '';
    this.template = '';
    this.api = api;
    this.context = api.resolve(options.pluginOptions.comp.baseDir);
  }
  log(text) {
    console.log(chalk.cyan(`${text}\n`));
  }
  warn(text) {
    console.log(chalk.yellow(`${text}\n`));
  }
  err(text) {
    console.log(chalk.red(`${text}\n`));
  }

  // 注入对话框
  async injectPrompt(options) {
    return inquirer.prompt(options);
  }

  // 获取用户输入的组件名称(可能包含的路径)
  async getComponentName() {
    const { componentName } = await this.injectPrompt({
      name: 'componentName',
      message: ' 请输入组件名称'
    });
    return componentName || '';
  }

  // 获取用户选择的装饰器配置信息
  async getDecorator() {
    const { decorator } = await this.injectPrompt({
      type: 'checkbox',
      message: '请选择您需要的装饰器(多选)',
      name: 'decorator',
      choices: [
        {
          name: 'Prop'
        },
        {
          name: 'Model'
        },
        {
          name: 'Watch'
        },
        {
          name: 'Emit'
        },
        {
          name: 'Mixins'
        },
        {
          name: 'Provide'
        },
        {
          name: 'Inject'
        }
      ]
    });
    return decorator;
  }

  // 获取用户对组件样式作用域的设置
  async getScoped() {
    const { scoped } = await this.injectPrompt({
      type: 'confirm',
      name: 'scoped',
      message: '样式是否只对当前组件有效? (默认为否)',
      default: false
    });
    return scoped;
  }

  // 检查用户输入的组件是否存在
  async existComponent() {
    const files = await globby(['**'], {
      cwd: this.context,
      expandDirectories: {
        files: [this.componentName],
        extensions: ['vue']
      },
      deep: true,
      onlyFiles: true
    });
    return (
      files &&
      files.length &&
      !!files.filter(item => item.indexOf(`${this.componentName}.vue`) > -1)
        .length
    );
  }

  // 检查组件名称是否规范
  async checkComponentName() {
    if (!/^[a-zA-Z][a-zA-Z\/]*$/g.test(this.componentName)) {
      return true;
    }
    return false;
  }

  // 解析输入的组件路径
  splitPath() {
    if (this.componentName.indexOf('/') > -1) {
      return this.componentName.split('/');
    }
    return [];
  }

  // 检查目录是否存在
  existDir(filePath) {
    return fs.existsSync(filePath);
  }

  // 创建目录
  mkdir(filePath) {
    fs.mkdirSync(filePath);
  }

  // 设置模板内容
  async replaceTemplate() {
    const decorator = await this.getDecorator();
    const scoped = await this.getScoped();
    let componentName = this.componentName;
    if (this.componentName.indexOf('/') > -1) {
      componentName = this.componentName.match(/\/\w*$/)[0];
    }
    this.template = `
<template>
  
</template>

<script lang="ts">
  import { Component, Vue ${decorator.length ? `, ${decorator.join(', ')}` : ''} } from 'vue-property-decorator';

  @Component
  export default class ${componentName} extends Vue {

  }
</script>

  <!-- Add "scoped" attribute to limit CSS to this component only -->
<style ${scoped ? 'scoped' : ''} lang="scss">

</style>`;
      return true;
  }

  // 创建文件并写入内容
  writeFile() {
    fs.writeFileSync(
      path.join(this.context, `${this.componentName}.vue`),
      this.template
    );
    this.log('组件创建成功!\n');
  }

  // 获取配置信息并写入文件
  async createFile() {
    if (await this.replaceTemplate()) {
      this.writeFile();
    }
  }

  // 执行
  async init() {
    this.componentName = await this.getComponentName();
    if (!this.componentName.length) {
      return this.init();
    }
    if (await this.existComponent()) {
      this.warn('组件已经存在');
      return this.init();
    } else if (await this.checkComponentName()) {
      this.warn('组件名必须由字母开头，且不能有空格');
      return this.init();
    }
    const paths = this.splitPath();
    let tempPath = '',
      tempContext = '';
    if (paths.length) {
      // 判断目录层级是否存在，不存在则创建
      for (const index in paths) {
        if (index < paths.length - 1) {
          tempPath = `${tempPath}/${paths[index]}`;
          tempContext = slash(path.join(this.context, tempPath));
          if (!this.existDir(tempContext)) {
            this.mkdir(tempContext);
          }
        }
      }
      this.createFile();
    } else {
      this.createFile();
    }
  }
}
