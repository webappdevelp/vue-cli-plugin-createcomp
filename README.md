# vue-cli-plugin-createcomp
快速创建 Vue Component 模板文件的 Service 插件，内置了组件必要的模板结构，避免了手动创建组件文件夹及文件的痛苦。

### 1、安装插件

在项目内使用`yarn add vue-cli-plugin-createcomp`安装插件。

### 2、添加 Node 执行命令

在所在项目的 package.json 文件里面找到 scripts 项，添加如下启动命令：

```json
"comp": "vue-cli-service comp",
```
### 3、配置插件参数

在所在目录下找到 **vue.config.js**或者新建 vue.config.js 配置：
```javascript
pluginOptions: {
    comp: {
        baseDir: 'src/components'
    }
}
```
### 4、执行

在所在项目内启动命令行工具，执行：`yarn comp`，然后根据插件提示完成组件的创建。