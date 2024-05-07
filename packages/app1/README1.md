### 配置遇到的坑
一 初始化项目时安装好prettier跟eslint各种插件后，vscode的setting也配置好editor.codeActionsOnSave为true了
但是保存自动格式化代码死活不生效。后面经过搜索得知，vite项目初始化的使用package.json文件里面的type属性为
module，此时所有js文件使用的时ESM规范，不支持commonjs规范，要使.eslintrc文件能被识别，需要改成xxx.cjs后
缀才可以。虽然可以设置type:commonjs使.eslintrc.js文件生效，但是保存文件不会自动格式化，而是得使用npm run
prettier命令才会使代码格式化。为避免遇到这个问题：1 新建eslintrc配置时使用 npx eslit --init命令，自动构
建好.eslintrc.cjs文件 2 使用新版本vite时记得使用.cjs的后缀。（搜索关键字：eslint的配置文件为什么要以.cjs结尾）

二 初始化项目生成的tsconfig.node.json文件是针对vite.config.ts文件配置的。如果moduleResolution属性不设为node,
就会导致vite.config.ts中有些插件的引用找不到。

### element-plus的坑
* 1 element-plus全局样式改变，由低版本的import 'element-plus/lib/theme-chalk/index.css'变为import 'element-plus/dist/index.css';
* 2 2.0+版本的input框会莫名出现类名为el-input__wrapper的dom，导致默认border会被挤进去一些
>解决方法1 组件或页面中使用:deep('.el-input__wrapper')处理
>解决方法2 main文件中引入覆盖样式，直接修改element-plus的类名样式

### ts开发three遇到的坑
* 1 引入gui的时候要three的npm包里看有没有export出来gui的方法文件大概路径为three/examples/jsm/libs，版本不一样文件名不一样的，引入方法时一定要注意

### vue3.0引入antd跟element plus组件库智能提示的问题
* 1 vue3.0在引入element plus 跟 antd等组件库的时候，如果需要出现标签属性提示，需要两个条件，安装volar插件与在tsconfig的complierOption中的types属性加上
    GlobalComponents的.d.ts文件的引入路径，例如 "types": ["element-plus/global", "ant-design-vue/typings/global"]!!!!