'use strict';

var shell = require('shelljs');
var _ = require('lodash');
var marked = require('marked');

function releaseNotes() {
  var gitLogOutput = shell.exec('git log --since=2.weeks --oneline', {silent: true}).output.split('\n');
  return gitLogOutput.map(extractIssueAndCommitMsg).reduce(groupIssues, {});
}

function extractIssueAndCommitMsg(line) {
  var lineMatchResult = line.match(/^[0-9a-z]{7} (.*)/);

  if (!lineMatchResult) {
    return null;
  }

  var commitMsgResult = lineMatchResult[1].match(/#(\d{4}) - (.*)/);

  if (!commitMsgResult) {
    return null;
  }

  return commitMsgResult.slice(1, 3);
}

function groupIssues(memo, tuple) {
  if (!tuple) {
    return memo;
  }

  var issueNum = tuple[0];
  var commitMsg = tuple[1];

  memo[issueNum] = memo[issueNum] || [];
  memo[issueNum].push(commitMsg);

  return memo;
}

function toMarkdown(notes) {
  var str = '';
  _.each(notes, function(v, k) {
    str += '## ' + k + '\n\n';
    str += '**Mingle issue**: http://mingle.nu/projects/packmanager/cards/' + k + '\n\n';
    str += '**Commit messages**:\n';
    str += v.map(bulletize).join('\n') + '\n\n';
  });
  return str;
}

function bulletize(str) {
  return '  * ' + str;
}

if (require.main === module) {
  console.log(marked(toMarkdown(releaseNotes())));
}

exports.releaseNotes = releaseNotes();
