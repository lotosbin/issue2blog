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
  .option('l', {
    alias: 'labels',
    describe: 'issue labels, split by ,',
    type: 'string',
    default: 'published'
  })
  .example('issue2blog --user lotosbin --repo lotosbin.github.io', '')
  .example('issue2blog -u lotosbin -r lotosbin.github.io -l done,published', 'generate blog by lables')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2019')
  .argv;

// console.log('hello ', argv.n);

async function getIssues(user, repo, labels) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
      }
    };
    var request = require('request');
    //https://api.github.com/repos/lotosbin/lotosbin.github.io/issues?labels=published
    request(`https://api.github.com/repos/${user}/${repo}/issues?labels=${labels}`, options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
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
  var URL = require('url').URL;

  var fileName = filenamify(`${moment(issue.created_at).format('YYYY-MM-DD')}-${issue.id}`)
  var title = issue.title;
  var body = issue.body;
  var url = issue.html_url;
  var summary = "";
  try {
    url = new URL(body.trim());
    summary = `[查看原文](${url})`
  } catch (e) {
    console.log(e)
  }
  var content = `---
title: "${title}"
commentId: ${issue.id}
tags: ${(issue.labels || []).map(it => it.name).join(',')}
original_link: "${url}"
summary: "${summary}"
---

${body}
    
[查看原文](${url})
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
var main = async (user, repo, labels) => {
  var issues = await getIssues(user, repo, labels);
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
  main(argv.user, argv.repo, argv.labels).then(a => {
    process.exit(0);
  }).catch(reason => {
    console.log(reason);
    process.exit(1);
  })
} else {
  process.exit(0);
}
