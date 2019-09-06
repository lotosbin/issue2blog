# issue2blog
transform github issues to jekyll blog

# usage
## 使用
```bash
npx issue2blog --user lotosbin --repo lotosbin.github.io
```
将从 github/lotosbin/lotosbin.github.io 获取标签为published的issue列表，生成blog到当前的_posts目录（自行创建该目录)。


## 参数

```bash
npx issue2blog -h
```

```
Options:
  --version   Show version number                                      [boolean]
  -u, --user  your github user name                          [string] [required]
  -r, --repo  your github repository name                    [string] [required]
  -h, --help  Show help                                                [boolean]

Examples:
  issue2blog --user lotosbin --repo lotosbin.github.io

copyright 2019
```
