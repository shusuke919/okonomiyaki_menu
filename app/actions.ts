"use server"

import nodemailer from "nodemailer"
import { z } from "zod"

// formSchemaを更新
const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(z.string()),
  toppings: z.record(z.array(z.string()).default([])),
})

const menuItems = {
  osaka: {
    name: "大阪風お好み焼き",
    price: 1200,
  },
  hiroshima: {
    name: "広島風お好み焼き",
    price: 1400,
  },
  modern: {
    name: "モダン焼き",
    price: 1300,
  },
  negiyaki: {
    name: "ねぎ焼き",
    price: 1000,
  },
  cheese: {
    name: "チーズお好み焼き",
    price: 1300,
  },
  mix: {
    name: "ミックスお好み焼き",
    price: 1500,
  },
}

// トッピングデータを追加
const toppingsOptions = {
  cheese: { name: "追加チーズ", price: 200 },
  pork: { name: "豚バラ追加", price: 250 },
  beef: { name: "牛肉追加", price: 300 },
  squid: { name: "イカ", price: 250 },
  shrimp: { name: "エビ", price: 300 },
  mochi: { name: "もち", price: 150 },
  egg: { name: "卵", price: 100 },
  mayo: { name: "マヨネーズ", price: 50 },
  negi: { name: "ねぎ", price: 100 },
  katsuobushi: { name: "かつお節", price: 50 },
  aonori: { name: "青のり", price: 50 },
}

export async function sendOrder(formData: z.infer<typeof formSchema>) {
  const validatedData = formSchema.parse(formData)

  // sendOrder関数内の注文商品の詳細を取得する部分を更新
  // 注文商品の詳細を取得
  const orderedItems = validatedData.items.map((itemId) => {
    const item = menuItems[itemId as keyof typeof menuItems]

    // この商品に選択されたトッピングを取得
    const selectedToppings = validatedData.toppings[itemId] || []
    const toppingsDetails = selectedToppings.map((toppingId) => {
      const topping = toppingsOptions[toppingId as keyof typeof toppingsOptions]
      return {
        name: topping.name,
        price: topping.price,
      }
    })

    // トッピングの合計金額を計算
    const toppingsTotal = toppingsDetails.reduce((sum, topping) => sum + topping.price, 0)

    return {
      name: item.name,
      price: item.price,
      toppings: toppingsDetails,
      toppingsTotal: toppingsTotal,
      totalPrice: item.price + toppingsTotal,
    }
  })

  // 合計金額を計算（トッピングを含む）
  const totalAmount = orderedItems.reduce((sum, item) => sum + item.totalPrice, 0)

  // メール本文を更新してトッピング情報を含める
  const mailBody = `
  新しい注文が入りました。
  
  【お客様情報】
  お名前: ${validatedData.name}
  メールアドレス: ${validatedData.email}
  電話番号: ${validatedData.phone}
  お届け先住所: ${validatedData.address}
  
  【注文内容】
  ${orderedItems
    .map((item) => {
      let itemText = `${item.name}: ¥${item.price}`
      if (item.toppings.length > 0) {
        itemText += `\n      トッピング: ${item.toppings.map((t) => `${t.name} (¥${t.price})`).join(", ")}`
        itemText += `\n      小計: ¥${item.totalPrice}`
      }
      return itemText
    })
    .join("\n    ")}
  
  合計金額: ¥${totalAmount}
  
  【備考】
  ${validatedData.notes || "なし"}
`

  // メール送信の設定
  // 注意: 実際の環境変数を設定する必要があります
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  // メール送信
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER,
      subject: `【注文】${validatedData.name}様からの新規注文`,
      text: mailBody,
    })

    // 確認メールの本文も同様に更新
    // 確認メールをお客様にも送信
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: validatedData.email,
      subject: `【大阪屋】ご注文ありがとうございます`,
      text: `
    ${validatedData.name}様
    
    この度はご注文いただき、誠にありがとうございます。
    以下の内容でご注文を承りました。
    
    【注文内容】
    ${orderedItems
      .map((item) => {
        let itemText = `${item.name}: ¥${item.price}`
        if (item.toppings.length > 0) {
          itemText += `\n        トッピング: ${item.toppings.map((t) => `${t.name} (¥${t.price})`).join(", ")}`
          itemText += `\n        小計: ¥${item.totalPrice}`
        }
        return itemText
      })
      .join("\n    ")}
    
    合計金額: ¥${totalAmount}
    
    【お届け先】
    ${validatedData.address}
    
    ご注文内容に関するお問い合わせは、このメールにご返信いただくか、
    店舗（TEL: 06-XXXX-XXXX）までお気軽にご連絡ください。
    
    ────────────────────
    大阪屋
    住所: 大阪府大阪市中央区XXXX
    TEL: 06-XXXX-XXXX
    Email: ${process.env.EMAIL_USER}
    ────────────────────
  `,
    })

    return { success: true }
  } catch (error) {
    console.error("メール送信エラー:", error)
    throw new Error("注文の送信に失敗しました")
  }
}

