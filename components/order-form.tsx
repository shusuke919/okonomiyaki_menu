"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { sendOrder } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// ------------------------------------------------------
// 1) バリデーション設定（items, toppings, seatなど）
// ------------------------------------------------------
const formSchema = z.object({
  name: z.string().min(1, {
    message: "お名前を入力してください",
  }),
  email: z.string().email({
    message: "有効なメールアドレスを入力してください",
  }),
  phone: z.string().min(1, {
    message: "電話番号を入力してください",
  }),
  address: z.string().min(1, {
    message: "住所を入力してください",
  }),
  notes: z.string().optional(),
  items: z.array(z.string()).refine((value) => value.length > 0, {
    message: "少なくとも1つの商品を選択してください",
  }),
  toppings: z.record(z.array(z.string()).default([])),
  seat: z.string().min(1, {
    message: "座席を選択してください",
  }),
});

// ------------------------------------------------------
// 2) 座席選択オプション
// ------------------------------------------------------
const seatOptions = [
  { id: "table-1", name: "テーブル1" },
  { id: "table-2", name: "テーブル2" },
  { id: "counter-1", name: "カウンター1" },
  { id: "counter-2", name: "カウンター2" },
];

// ------------------------------------------------------
// 3) トッピングオプション
// ------------------------------------------------------
const toppingsOptions = [
  { id: "friedEgg", name: "目玉焼き", price: 180 }, // ねぎ焼き系で使用
  { id: "garlic", name: "国産にんにく", price: 250 },
  { id: "jalapeno", name: "ハラペーニョ酢漬け", price: 150 },
  { id: "kimchi", name: "キムチ", price: 250 },
  { id: "springOnion", name: "山盛りねぎ", price: 350 },
  { id: "extraIngredients", name: "具材追加", price: 250 },
  { id: "cheeseSingle", name: "熱々とろ〜りチーズ (シングル)", price: 380 },
  { id: "cheeseDouble", name: "熱々とろ〜りチーズ (ダブル)", price: 620 },
  { id: "noodleLarge", name: "麺大盛 (麺1.5倍)", price: 390 }, // 焼きそばで使用
];

// ------------------------------------------------------
// 4) フードメニュー（今回は「お好みメニュー」枠でまとめ表示）
//    ※ 必要に応じてカテゴリー別に分割してもOKです
// ------------------------------------------------------
const okonomiItems = [
  // ★ お好み焼き ★
  {
    id: "okonomiyaki-buta",
    name: "ブタ",
    description: "お好み焼き",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "okonomiyaki-suji",
    name: "スジ",
    description: "お好み焼き",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "okonomiyaki-ika",
    name: "イカ",
    description: "お好み焼き",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "okonomiyaki-ebi",
    name: "エビ",
    description: "お好み焼き",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "okonomiyaki-tako",
    name: "タコ",
    description: "お好み焼き",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "okonomiyaki-mix",
    name: "ミックス（ブタ・スジ・イカ・エビ・タコ）",
    description: "お好み焼き",
    price: 2100,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "okonomiyaki-seafood",
    name: "海鮮ミックス（イカ・エビ・タコ）",
    description: "お好み焼き",
    price: 2100,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ★ 米粉のねぎ焼き ★
  {
    id: "negiyaki-buta",
    name: "ブタ",
    description: "米粉のねぎ焼き（レモン醤油ベース）",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "negiyaki-suji",
    name: "スジ",
    description: "米粉のねぎ焼き（レモン醤油ベース）",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "negiyaki-ika",
    name: "イカ",
    description: "米粉のねぎ焼き（レモン醤油ベース）",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "negiyaki-ebi",
    name: "エビ",
    description: "米粉のねぎ焼き（レモン醤油ベース）",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "negiyaki-tako",
    name: "タコ",
    description: "米粉のねぎ焼き（レモン醤油ベース）",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "negiyaki-mix",
    name: "ミックス（ブタ・スジ・イカ・エビ・タコ）",
    description: "米粉のねぎ焼き（レモン醤油ベース）",
    price: 2100,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "negiyaki-seafood",
    name: "海鮮ミックス（イカ・エビ・タコ）",
    description: "米粉のねぎ焼き（レモン醤油ベース）",
    price: 2100,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ★ サラダ ★
  {
    id: "salad-tomato-onion",
    name: "美味しいトマトと玉ねぎのサラダ",
    description: "",
    price: 670,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "salad-potato",
    name: "こだわりのポテトサラダ",
    description: "",
    price: 680,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "salad-caesar",
    name: "彩り野菜のシーザーサラダ",
    description: "",
    price: 1180,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ★ 鉄板焼き ★
  {
    id: "teppan-nagaimo",
    name: "長芋ステーキ",
    description: "",
    price: 800,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-tomato-cheese",
    name: "美味しいトマトのチーズ焼き",
    description: "",
    price: 1000,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-buta-kimchi",
    name: "豚キムチ炒め",
    description: "",
    price: 1180,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-sunagimo",
    name: "砂肝のガーリックバター",
    description: "",
    price: 1000,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-tonpei",
    name: "寛のとんぺい焼き",
    description: "",
    price: 1000,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-tonpei-cheese",
    name: "寛のとんぺい焼き たっぷりチーズ",
    description: "",
    price: 1180,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-bacon-egg",
    name: "厚切りベーコンステーキ・目玉焼き添え",
    description: "",
    price: 1080,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-suji-omelette",
    name: "自家製牛スジのオムレツ",
    description: "",
    price: 1280,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-moyashi-meat",
    name: "増し増しお肉のもやし炒め",
    description: "",
    price: 1200,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-hormone-mix",
    name: "黒毛和牛のミックスホルモン塩ダレ焼き",
    description: "",
    price: 1650,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-sobameshi",
    name: "本気のそばめし",
    description: "",
    price: 2150,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-filet-steak",
    name: "国産牛ヒレ肉のステーキ (120g)",
    description: "",
    price: 3800,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "teppan-filet-chateaubriand",
    name: "国産牛ヒレ肉のステーキ シャトーブリアン (120g)",
    description: "",
    price: 4300,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ★ 焼きそば (ソース or 塩) ★
  {
    id: "yakisoba-buta",
    name: "ブタ（ソース or 塩）",
    description: "生米粉麺の焼きそば",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "yakisoba-suji",
    name: "スジ（ソース or 塩）",
    description: "生米粉麺の焼きそば",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "yakisoba-ika",
    name: "イカ（ソース or 塩）",
    description: "生米粉麺の焼きそば",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "yakisoba-ebi",
    name: "エビ（ソース or 塩）",
    description: "生米粉麺の焼きそば",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "yakisoba-tako",
    name: "タコ（ソース or 塩）",
    description: "生米粉麺の焼きそば",
    price: 1630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "yakisoba-mix",
    name: "ミックス（ブタ・スジ・イカ・エビ・タコ）",
    description: "生米粉麺の焼きそば",
    price: 2100,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "yakisoba-seafood",
    name: "海鮮ミックス（イカ・エビ・タコ）",
    description: "生米粉麺の焼きそば",
    price: 2100,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "yakisoba-omu",
    name: "とろとろ卵のオムそば",
    description: "＋580円で全品オムそばに変更可",
    price: 580, // 実際には追加料金として扱う想定
    image: "/placeholder.svg?height=200&width=300",
  },

  // ★ ご飯もの ★
  {
    id: "rice-sobameshi-garlic",
    name: "本気のそばめし ガーリック",
    description: "",
    price: 2390,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "rice-sobameshi",
    name: "本気のそばめし",
    description: "",
    price: 2150,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "rice-white",
    name: "ライス",
    description: "",
    price: 390,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "rice-umeboshi",
    name: "自家製梅干し (南高梅) 1粒",
    description: "",
    price: 220,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ★ デザート ★
  {
    id: "dessert-sorbet",
    name: "本日のシャーベット",
    description: "",
    price: 400,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "dessert-icecream",
    name: "本日のアイスクリーム",
    description: "",
    price: 400,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "dessert-french-toast",
    name: "鉄板フレンチトースト バニラアイス添え",
    description: "",
    price: 990,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "dessert-french-toast-mini",
    name: "鉄板ミニフレンチトースト バニラアイス添え",
    description: "",
    price: 0, // メニュー表に価格記載なし（必要に応じて設定）
    image: "/placeholder.svg?height=200&width=300",
  },
];

// ------------------------------------------------------
// 5) ドリンクメニュー
//    （ユーザー提供メニューと合体する場合は適宜編集）
// ------------------------------------------------------
const drinkItems = [
  // ■□BEER□■
  {
    id: "beer_premium_malts",
    name: "ザ・プレミアム・モルツ",
    description: "レギュラーサイズ",
    price: 690,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "beer_premium_malts_small",
    name: "ザ・プレミアム・モルツ (小グラス)",
    description: "",
    price: 630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "beer_shandygaff",
    name: "シャンディガフ",
    description: "",
    price: 700,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "beer_allfree",
    name: "オールフリー",
    description: "ノンアルコールビールテイスト飲料",
    price: 600,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ■□LEMON SOUR□■
  {
    id: "lemon_sour_kodawari",
    name: "こだわり酒場のレモンサワー (通常)",
    description: "",
    price: 560,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "lemon_sour_kodawari_strong",
    name: "こだわり酒場のレモンサワー (濃いめ)",
    description: "",
    price: 630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "lemon_sour_kodawari_extra_strong",
    name: "こだわり酒場のレモンサワー (超濃いめ)",
    description: "",
    price: 700,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "lemon_sour_otsukare",
    name: "お疲れ様レモンサワー",
    description: "",
    price: 630,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "lemon_sour_hachimitsu",
    name: "はちみつレモンサワー",
    description: "",
    price: 660,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "lemon_sour_frozen_lemon",
    name: "冷凍レモン丸々1個のレモンサワー",
    description: "",
    price: 700,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "lemon_sour_frozen_lemon_refill",
    name: "冷凍レモンサワー (中のおかわり)",
    description: "",
    price: 560,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "lemon_sour_namasibori",
    name: "国産レモン生搾りレモンサワー",
    description: "",
    price: 690,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ■□SOUR□■
  {
    id: "sour_oolong",
    name: "ウーロンハイ",
    description: "",
    price: 560,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "sour_greentea",
    name: "緑茶ハイ",
    description: "",
    price: 590,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "sour_black_oolong",
    name: "黒ウーロンハイ",
    description: "",
    price: 680,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "sour_naizobijin",
    name: "内臓美人ハイ",
    description: "",
    price: 750,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "sour_baisu",
    name: "バイスサワー(シソうめ)",
    description: "",
    price: 590,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "sour_onioroshi_pine",
    name: "鬼おろしパインサワー",
    description: "",
    price: 680,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "sour_ume",
    name: "自家製梅干しのサワー",
    description: "",
    price: 720,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "sour_naka_okawari",
    name: "中のおかわり (サワー共通)",
    description: "",
    price: 550,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ■□HIGH BALL□■
  {
    id: "highball_kaku",
    name: "角ハイボール",
    description: "",
    price: 600,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "highball_cola",
    name: "コーラハイボール",
    description: "",
    price: 700,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "highball_ginger",
    name: "ジンジャーハイボール",
    description: "",
    price: 700,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ■□WHISKY□■ (ロック・水割り・ソーダ割)
  {
    id: "whisky_hakushu",
    name: "白州",
    description: "ロック・水割り・ソーダ割",
    price: 1280,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "whisky_yamazaki",
    name: "山崎",
    description: "ロック・水割り・ソーダ割",
    price: 1280,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "whisky_chita",
    name: "知多",
    description: "ロック・水割り・ソーダ割",
    price: 890,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ■□SHOCHU□■ (ロック・水割り・お湯割・ソーダ割)
  {
    id: "shochu_osumi_imo",
    name: "大隅 (芋)",
    description: "",
    price: 600,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "shochu_dorokame",
    name: "泥亀",
    description: "",
    price: 680,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "shochu_kiccho_houzan",
    name: "吉兆宝山",
    description: "",
    price: 880,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "shochu_osumi_mugi",
    name: "大隅 (麦)",
    description: "",
    price: 600,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "shochu_hitotsubu_no_mugi",
    name: "一粒の麦",
    description: "",
    price: 680,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "shochu_tsukushi",
    name: "つくし",
    description: "",
    price: 800,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ■□UMESHU・KAJITSUSHU□■ (ソーダ割・ロック)
  {
    id: "ume_aragoshi_umeshu",
    name: "あらごし 梅酒",
    description: "",
    price: 690,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "ume_aragoshi_momo",
    name: "あらごし もも",
    description: "",
    price: 690,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ■□GLASS WINE□■
  {
    id: "glass_wine_white",
    name: "グラスワイン (白)",
    description: "",
    price: 600,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "glass_wine_red",
    name: "グラスワイン (赤)",
    description: "",
    price: 600,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ■□BOTTLE WINE□■

  // SPARKLING WINE
  {
    id: "bottle_dibon_brut",
    name: "ディボン ブリュット ナチュール",
    description: "［スペイン］辛口 (750ml)",
    price: 3500,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "bottle_mionetto_prosecco_750",
    name: "ミオネット プロセッコ DOC (750ml)",
    description: "［イタリア］辛口",
    price: 4300,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "bottle_mionetto_prosecco_200",
    name: "ミオネット プロセッコ DOC (200ml)",
    description: "［イタリア］辛口",
    price: 1500,
    image: "/placeholder.svg?height=200&width=300",
  },

  // WHITE WINE
  {
    id: "bottle_white_720",
    name: "白ワイン (720ml)",
    description: "",
    price: 3700,
    image: "/placeholder.svg?height=200&width=300",
  },

  // RED WINE
  {
    id: "bottle_red_750",
    name: "赤ワイン (750ml)",
    description: "",
    price: 3500,
    image: "/placeholder.svg?height=200&width=300",
  },

  // CHAMPAGNE
  {
    id: "bottle_moet_imperial",
    name: "モエ エ シャンドン モエ アンペリアル (750ml)",
    description: "［フランス］辛口",
    price: 10000,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "bottle_vcp_yellow_label",
    name: "ヴーヴ クリコ イエローラベル (750ml)",
    description: "［フランス］辛口",
    price: 16000,
    image: "/placeholder.svg?height=200&width=300",
  },

  // ■□SOFT DRINK□■
  // ソフトドリンク各種 (一律450円)
  {
    id: "soft_drink_green_tea",
    name: "緑茶",
    description: "ソフトドリンク",
    price: 450,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "soft_drink_oolong_tea",
    name: "ウーロン茶",
    description: "ソフトドリンク",
    price: 450,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "soft_drink_jasmine_tea",
    name: "ジャスミン茶",
    description: "ソフトドリンク",
    price: 450,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "soft_drink_cola",
    name: "コーラ",
    description: "ソフトドリンク",
    price: 450,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "soft_drink_ginger_ale",
    name: "ジンジャーエール",
    description: "ソフトドリンク",
    price: 450,
    image: "/placeholder.svg?height=200&width=300",
  },
  // 黒ウーロン茶
  {
    id: "soft_drink_black_oolong",
    name: "黒ウーロン茶",
    description: "ソフトドリンク",
    price: 550,
    image: "/placeholder.svg?height=200&width=300",
  },
  // 内臓美人茶
  {
    id: "soft_drink_naizobijin",
    name: "内臓美人茶",
    description: "ソフトドリンク",
    price: 650,
    image: "/placeholder.svg?height=200&width=300",
  },
  // 100%ジュース類
  {
    id: "soft_drink_apple_juice",
    name: "青森りんごジュース (ストレート果汁100%)",
    description: "ソフトドリンク",
    price: 600,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "soft_drink_mikan_juice",
    name: "温州みかんジュース (ストレート果汁100%)",
    description: "ソフトドリンク",
    price: 600,
    image: "/placeholder.svg?height=200&width=300",
  },
];

// ------------------------------------------------------
// 6) おつまみメニュー（「アテ＆スピード一品」＋既存）
// ------------------------------------------------------
const snackItems = [
  {
    id: "fries",
    name: "フライドポテト",
    description: "カリカリのポテト",
    price: 400,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "edamame",
    name: "枝豆",
    description: "塩ゆでした枝豆",
    price: 300,
    image: "/placeholder.svg?height=200&width=300",
  },
  // ★ アテ＆スピード一品 ★
  {
    id: "speed-kabu-umeboshi",
    name: "カブの自家製梅酢漬け",
    description: "",
    price: 400,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "speed-kimchi",
    name: "キムチ",
    description: "",
    price: 500,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "speed-umesuisho",
    name: "梅水晶 (鮫軟骨の梅肉和え)",
    description: "",
    price: 480,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "speed-chanja",
    name: "真タラのチャンジャ",
    description: "",
    price: 480,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "speed-cucumber-ume",
    name: "たたききゅうり梅和え",
    description: "",
    price: 600,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "speed-porkjerky",
    name: "ポークジャーキー（自家製マヨネーズで）",
    description: "",
    price: 650,
    image: "/placeholder.svg?height=200&width=300",
  },
];

// ------------------------------------------------------
// 7) メインのコンポーネント
// ------------------------------------------------------
export default function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // useFormのdefaultValuesにtoppingsとseatを追加
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      items: [],
      toppings: {},
      seat: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await sendOrder(values);
      toast({
        title: "注文を受け付けました",
        description:
          "ご注文ありがとうございます。まもなく確認メールが届きます。",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description:
          "注文の送信中に問題が発生しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* ★ お好みメニューセクション（フード全般）★ */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-[#8C2D18] border-b pb-2">
            お好みメニュー
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {okonomiItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-[#E8D3BB] hover:shadow-lg transition-shadow"
              >
                {/* <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                /> */}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-[#594A3C]">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <p className="font-bold text-[#8C2D18]">¥{item.price}</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="items"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 mt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, item.id]);
                                // チェックされたらトッピング配列も初期化
                                const currentToppings =
                                  form.getValues("toppings");
                                form.setValue("toppings", {
                                  ...currentToppings,
                                  [item.id]: [],
                                });
                              } else {
                                field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item.id
                                  )
                                );
                                // チェックが外れたらトッピング情報を削除
                                const currentToppings = {
                                  ...form.getValues("toppings"),
                                };
                                delete currentToppings[item.id];
                                form.setValue("toppings", currentToppings);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          選択する
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  {/* トッピングセクション */}
                  {form.watch("items").includes(item.id) && (
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                      <p className="text-sm font-medium text-[#594A3C] mb-2">
                        トッピング
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {toppingsOptions.map((topping) => (
                          <FormField
                            key={`${item.id}-${topping.id}`}
                            control={form.control}
                            name={`toppings.${item.id}`}
                            render={({ field: toppingField }) => (
                              <FormItem className="flex items-center space-x-1 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={toppingField.value?.includes(
                                      topping.id
                                    )}
                                    onCheckedChange={(checked) => {
                                      const currentToppings =
                                        toppingField.value || [];
                                      if (checked) {
                                        toppingField.onChange([
                                          ...currentToppings,
                                          topping.id,
                                        ]);
                                      } else {
                                        toppingField.onChange(
                                          currentToppings.filter(
                                            (id) => id !== topping.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-xs font-normal cursor-pointer">
                                  {topping.name} (+¥{topping.price})
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {form.formState.errors.items && (
            <p className="text-red-500 text-sm mt-2">
              {form.formState.errors.items.message}
            </p>
          )}
        </div>

        {/* ★ ドリンクメニューセクション ★ */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-[#8C2D18] border-b pb-2">
            ドリンクメニュー
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drinkItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-[#E8D3BB] hover:shadow-lg transition-shadow"
              >
                {/* <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                /> */}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-[#594A3C]">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <p className="font-bold text-[#8C2D18]">¥{item.price}</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="items"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 mt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, item.id]);
                              } else {
                                field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item.id
                                  )
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          選択する
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ★ おつまみメニューセクション ★ */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-[#8C2D18] border-b pb-2">
            おつまみメニュー
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snackItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-[#E8D3BB] hover:shadow-lg transition-shadow"
              >
                {/* <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                /> */}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-[#594A3C]">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <p className="font-bold text-[#8C2D18]">¥{item.price}</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="items"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 mt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, item.id]);
                              } else {
                                field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item.id
                                  )
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          選択する
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ★ テーブル情報＆備考 ★ */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-[#8C2D18] border-b pb-2">
            テーブル情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="seat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>座席</FormLabel>
                  <FormControl>
                    <select {...field} className="border rounded px-3 py-2">
                      <option value="">座席を選択</option>
                      {seatOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel>備考</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ご要望などがございましたらご記入ください"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ★ 送信ボタン ★ */}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-[#8C2D18] hover:bg-[#6A2112] text-white px-8 py-6 text-lg rounded-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "送信中..." : "注文する"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
