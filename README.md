# vue-cli-plugin-createcomp
快速创建 Vue Component 模板文件的 Service 插件，内置了组件必要的模板结构，避免了手动创建组件文件夹及文件的痛苦。

### 添加 Node 执行命令

在所在项目的 package.json 文件里面找到 scripts 项，添加如下启动命令：

```json
"comp": "vue-cli-service comp",
```
### 配置插件参数

在所在目录下找到 **vue.config.js**或者新建 vue.config.js 配置：
```json
pluginOptions: {
    comp: {
        baseDir: '/src/components'
    }
}
```
### 配置 Service
将本仓库的 index.js 文件拷贝到所在项目的 **node_modules/@vue/cli-service/lib/commands/** 目录下，并在 **commands/** 同级目录下编辑**Service.js**：
```javascript
const builtInPlugins = [
      './commands/serve',
      './commands/build',
      './commands/inspect',
      './commands/help',
      './commands/comp',  // 新增的命令文件
      // config plugins are order sensitive
      './config/base',
      './config/css',
      './config/dev',
      './config/prod',
      './config/app'
    ].map(idToPlugin)
```
### 运行
启动命令窗口，执行`yarn comp`，选择模板所需的修饰器后，就会在配置的 **comp.baseDir**目录下面创建好你的组件文件了。
