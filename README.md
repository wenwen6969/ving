### 微前端实现方式之--git submodule

### pnpm 使用小结

## 优点

- 1 可以多个分包共享一个 npm 包
- 2 下载速度快

## 缺点

- 1 修改.npmrc 文件时会全部重新下载依赖包
- 2 主包与分包的规范容易冲突
* 3 注意一点，pnpm模块查找都是去查node_modules下的.pnpm文件夹下的包的，由于pnpm是扁平化下载设计，会导致下载包的时候会跟npm下下来的包有差异，npm下包会自动将需要依赖的其他包一起下载，而pnpm并不会，所以就会导致某些包找不到，此时就可能会费时费力的去找缺的东西了。

### pnpm 遇到的坑！！！

- 用 pnpm 下载好全部依赖后，分包里面无需继续下载，但是分包里用的 element-plus 与 antd 的组件属性提示会消失掉
- 对 element-plus 的解决方案是配置.npmrc 文件的 public-hoist-pattern[]=@vue/runtime-core，这个原因是@vue/runtime-core 是 vue 模块下的依赖，不是顶级 依赖，导致声明语句失效。
- 对 antd 的解决方法是需要在子包里面把 antd 包给下载下来，这样才会有提示。antd 包的组件提示声明的依赖是 vue（不知道原因）。
* 补上antd内置组件提示不生效原因：因为对@vue/runtime-core模块做了顶级提升。而antd-vue的模块声明是以vue.d.ts声明的，而vue.d.ts会引入@vue/runtime-core，
  由于做了提升，导致vue.d.ts找不到@vue/runtime-core模块，所以声明会失效。

### vscode 编辑器配置

- 首先编辑器会读取.vscode 文件夹里面的 settings.json 文件的配置，其次然后去读首选项的 sttings.json 文件里面的配置。配置内容可以重复。
- 其次关于保存自动格式化可以有三个选项的配置，分别为
  `
//保存时编辑器自动格式化，格式化时使用编辑器指定的默认配置
"editor.formatOnSave": true
// 开启eslint自动修复js/ts功能 每次保存的时候将代码按eslint格式进行修复 ,"eslint.autoFixOnSave": true 这个已经过时了，前提是eslint插件配置生效
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
},
//针对vue文件保存的配置，对于ts和js文件不生效。能保存自动格式化vue文件生效。前提是eslint插件配置生效。
"[vue]": {
  // "editor.defaultFormatter": "octref.vetur",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode"
},`

### pnpm配置eslintd的坑
* eslint 配置的各种插件包都安装到node_modules里还有.eslintrc文件也配置好了。但是vscode就是没提示错误。
* 新版的vscode底部状态栏没有eslint图标，迁移到了output那里切换才找到eslint配置有没有配置，才知道vscode没有提示是因为vue-eslint-parser这个模块没有安装
* 如果用npm安装eslint的话，vue-eslint-parser这个模块会自动安装，pnpm则不会自动安装，需要手动安装上这个包，否则vscode插件会报错。

### 关于pnpm 的一个知识点
* pnpm 安装各种包的时候会出现unmet peer的情况。问题原因：在 npm 3 中，不会再强制安装 peerDependencies （对等依赖）中所指定的包，而是通过警告的方式来提示我们。
* 解决方案：
  1 在.npmrc文件中设置strict-peer-dependencies=false 
  2 npm config set strict-peer-dependencies=false 
  3 在packages.json中配置` "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": [
        "react"
      ]
    }
    } `

### 关于uniapp使用qs包的一个坑
* uniapp编译成小程序报module 'common/side-channel.js' is not defined, require args is 'side-channel'
* 原因是qs包版本过低，将包版本改为6.5.2以上即可解决

### 要彻底删除Git仓库中的子模块，需要执行以下步骤：

* 1 删除子模块的相关文件。在父仓库中，打开.gitmodules文件，找到要删除的子模块的条目，将其删除。然后，删除.git/modules/子模块名称目录中的所有文件。删除子模块的引用。在父仓库中，使用以下命令删除子模块的引用：
* 2 git rm --cached 子模块名称，这将从父仓库中删除子模块的引用。
* 3 提交更改。在父仓库中，使用以下命令提交更改：git commit -m "Remove submodule 子模块名称"，这将提交更改并将子模块从父仓库中彻底删除。