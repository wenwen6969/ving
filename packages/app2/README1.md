
###代码上传GitHub遇到的问题
`
Logon failed, use ctrl+c to cancel basic credential prompt.
remote: Support for password authentication was removed on August 13, 2021.
remote: Please see https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories#cloning-w
`
..网上说原因是因为git 版本过低 （未亲自验证）
..解决方案是去GitHub上设置token
..然后使用以下命令上传
`
git remote set-url origin https://<your_token>@github.com/<USERNAME>/<REPO>.git
<your_token>：换成你自己得到的token
<USERNAME>：是你自己github的用户名
<REPO>：是你的仓库名称
`