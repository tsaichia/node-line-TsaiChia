// 引用 linebot 套件
import linebot from 'linebot'
//  引用 dotenv 套件
import dotenv from 'dotenv'
//  引用 request-promise 套件
import rp from 'request-promise'

import schedule from 'node-schedule'

// 讀取 .env 檔
dotenv.config()

// 宣告機器人的資訊
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

//  加入好友
// bot.on('follow', async (event) => {
//   let msg = ''
//   try {
//     msg = '哈囉囉囉~感謝你加我好友\nLOVE YOU~'
//   } catch (error) {
//     msg = 'Oops!發生錯誤'
//   }
//   event.reply(msg)
// })

let data = {}
const getData = async () => {
  data = await rp({ uri: 'https://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL', json: true })
  getKind('貓')
}

getData()
console.log(data)

schedule.scheduleJob('0 0 0 * *', getData())

// 當收到訊息時
const getKind = async (kind) => {
  const arr = []
  const arr2 = []
  let msg = []

  try {
    const all = data.filter(function (x) {
      // console.log(x.animal_kind)
      return x.animal_kind === kind
    })
    // console.log(all)

    for (const d of data) {
      const ak = d.animal_kind
      if (ak === kind) {
        arr.push(d.animal_place)
        arr2.push(d.album_file)
      }
    }
    // console.log(arr2[0])
    const rand = Math.floor(Math.random() * arr.length)
    const rand2 = Math.floor(Math.random() * arr2.length)
    msg.push({
      type: 'image',
      originalContentUrl: all[rand2].album_file,
      previewImageUrl: all[rand2].album_file
    },
    {
      type: 'text',
      text: all[rand].animal_place
    },
    {
      type: 'text',
      text: all[rand].shelter_tel
    },
    {
      type: 'text',
      text: all[rand].shelter_address
    }

    )
    console.log(all[rand].shelter_tel)
    console.log(all[rand].animal_place)
    console.log(all[rand].album_file)
  } catch (error) {
    console.log(error)
    msg = 'Oops!\u{100085}\u{100085}\n要輸入\n狗\u{10005E}或貓\u{10005F}喔!'
  }
  // console.log(msg)
  return msg
}

bot.on('message', async (event) => {
  let msg = ''
  if (event.message.type === 'text') {
    msg = await getKind(event.message.text)
  }
  // console.log(msg)
  event.reply(msg)
})

// 在PORT 啟動
bot.listen('/', process.env.PORT, () => {
  console.log('機器人已啟動')
})
