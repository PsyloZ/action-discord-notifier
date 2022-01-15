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

const commits = githubPayload.commits.map(i => `\n🪓 ${escapeMd(i.message)}`)
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
      url: 'https://fivem.net',
      description: `**${commits.join('\n')}**`,
      timestamp: new Date(),
      footer: {
        text: `Build serveur: ${shortSha(afterSha)}`,
        icon_url: 'https://cdn.discordapp.com/attachments/854833436916711494/898941236222771250/LOGO.png',
      },
      image: {
        url: 'https://cdn.discordapp.com/attachments/902102202695446538/931883022637228052/banniere_MAJ.gif',
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
