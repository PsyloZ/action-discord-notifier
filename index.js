const axios = require('axios')

const core = require('@actions/core')
const github = require('@actions/github')

const webhook = core.getInput('webhook')

if (!/https:\/\/discord(app|)\.com\/api\/webhooks\/\d+?\/.+/i.exec(webhook)) {
  core.setFailed('The given discord webhook url is invalid. Please ensure you give a **full** url that start with "https://discordapp.com/api/webhooks"')
}

const shortSha = (i) => i.substr(0, 7)

const escapeMd = (str) => str.replace(/([\[\]\\`\(\)])/g, '\\$1')

const { payload: githubPayload } = github.context

//const commits = githubPayload.commits.map(i => `\n🪓 ${escapeMd(i.message)}`)

const commits = githubPayload.commits
  .filter(commit => !commit.message.includes("--nopost")) // Filter out commits containing "--nopost"
  .map(commit => `\n🪓 ${escapeMd(commit.message)}`);

console.log(githubPayload)

const authorname = githubPayload.sender.login
const authorimage = githubPayload.sender.avatar_url

if (!commits.length) {
  return
}
console.log(githubPayload)
const beforeSha = githubPayload.before
const afterSha = githubPayload.after

const payload = {
  content: '',
  embeds: [
    {
      color: 0xDB9834,
      author: {
        name: authorname,
        icon_url: authorimage,
      },
      title: '📰 Mise a jour',
      url: 'https://forum.libertyv.gg',
      description: `**${commits.join('\n')}**`,
      timestamp: new Date(),
      footer: {
        text: `Build serveur: ${shortSha(afterSha)}`,
        icon_url: 'https://cdn.libertyv.gg/u/Onid/YUzoZv.png',
      },
      image: {
        url: 'https://cdn.psyloz.tv/901037580282363914/banniere%20MAJ.gif.gif',
      },
    }
  ]
}

axios
  .post(webhook, payload)
  .then((res) => {
    core.setOutput('result', 'Webhook sent')
  })
  .catch((err) => {
    core.setFailed(`Post to webhook failed, ${err}`)
  })
