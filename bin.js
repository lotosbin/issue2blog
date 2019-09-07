#!/usr/bin/env node
var argv = require('yargs')
  .option('u', {
    alias: 'user',
    demand: true,
    describe: 'your github user name',
    type: 'string'
  })
  .option('r', {
    alias: 'repo',
    demand: true,
    describe: 'your github repository name',
    type: 'string'
  })
  .example('issue2blog --user lotosbin --repo lotosbin.github.io', '')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2019')
  .argv;

// console.log('hello ', argv.n);

async function getIssues(user, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
      }
    };
    var request = require('request');
    request(`https://api.github.com/repos/${user}/${repo}/issues?labels=published`, options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(JSON.parse(body));
      } else {
        reject(error || `${response.statusCode}`)
      }
    })
  })
}
const filenamify = require('filenamify');

async function issueToArticle(issue) {
  var moment = require('moment');
  var fileName = filenamify(`${moment(issue.created_at).format('YYYY-MM-DD')}-${issue.id}`)
  var title = issue.title;
  var body = issue.body;
  var content = `---
title: ${issue.title}
commentId: ${issue.id}
---
# ${title}

${body}
    
[view on github](${issue.html_url})
    `
  return { fileName, content }
}
const fs = require('fs');
async function writeArticleToFile(article) {
  return new Promise((resolve, reject) => {
    var filePath = `_posts/${article.fileName}.markdown`;
    fs.writeFile(filePath, `${article.content}`, function (err) {
      if (err) {
        console.log(err);
        reject(err);
        return
      }

      console.log(`generate file ${filePath}`);
      resolve({ filePath })
    });
  })
}
var main = async (user, repo) => {
  var issues = await getIssues(user, repo);
  for (i in issues) {
    var issue = issues[i];
    var article = await issueToArticle(issue);
    await writeArticleToFile(article);
  }
}

process.on('SIGINT', function () {
  console.log('Got a SIGINT');
  process.exit(0);
});
if (argv.user && argv.repo) {
  main(argv.user, argv.repo)
  // if (err) {
  //   process.exit(1);
  // } else {
  //   process.exit(0);
  // }
}
