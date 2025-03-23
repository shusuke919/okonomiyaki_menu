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

// formSchemaを更新して、toppingsフィールドとseatフィールドを追加します
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

// トッピングのデータを追加します（お好み焼き専用）
const toppingsOptions = [
  { id: "cheese", name: "追加チーズ", price: 200 },
  { id: "pork", name: "豚バラ追加", price: 250 },
  { id: "beef", name: "牛肉追加", price: 300 },
  { id: "squid", name: "イカ", price: 250 },
  { id: "shrimp", name: "エビ", price: 300 },
  { id: "mochi", name: "もち", price: 150 },
  { id: "egg", name: "卵", price: 100 },
  { id: "mayo", name: "マヨネーズ", price: 50 },
  { id: "negi", name: "ねぎ", price: 100 },
  { id: "katsuobushi", name: "かつお節", price: 50 },
  { id: "aonori", name: "青のり", price: 50 },
];

// 座席選択用のオプションを追加します
const seatOptions = [
  { id: "seat1", name: "1番席" },
  { id: "seat2", name: "2番席" },
  { id: "seat3", name: "3番席" },
  { id: "seat4", name: "4番席" },
];

// お好み焼きメニュー
const okonomiItems = [
  {
    id: "osaka",
    name: "大阪風お好み焼き",
    description: "キャベツたっぷり、豚肉と海鮮の具材入り",
    price: 1200,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "hiroshima",
    name: "広島風お好み焼き",
    description: "麺入り、重ね焼きスタイル",
    price: 1400,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "modern",
    name: "モダン焼き",
    description: "焼きそば入りの贅沢なお好み焼き",
    price: 1300,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "negiyaki",
    name: "ねぎ焼き",
    description: "ねぎたっぷりのシンプルな味わい",
    price: 1000,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "cheese",
    name: "チーズお好み焼き",
    description: "とろけるチーズがたっぷり",
    price: 1300,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "mix",
    name: "ミックスお好み焼き",
    description: "いろんな具材が入った特製お好み焼き",
    price: 1500,
    image: "/placeholder.svg?height=200&width=300",
  },
];

// ドリンクメニュー
const drinkItems = [
  {
    id: "cola",
    name: "コーラ",
    description: "冷たい炭酸飲料",
    price: 300,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "beer",
    name: "ビール",
    description: "キンキな生ビール",
    price: 500,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "water",
    name: "お水",
    description: "冷たい水",
    price: 100,
    image: "/placeholder.svg?height=200&width=300",
  },
];

// おつまみメニュー
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
];

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
        {/* お好みメニューセクション */}
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
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                />
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
                                // お好みメニューの場合、トッピング用の初期化
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
                  {/* トッピングセクション（お好みメニューのみ） */}
                  {form.watch("items").includes(item.id) && (
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                      <p className="text-sm font-medium text-[#594A3C] mb-2">
                        トッピング
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {toppingsOptions.map((topping) => (
                          <FormField
                            key={`${item.id}-${topping.id}`}
                            control={form.control}
                            name={`toppings.${item.id}`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-1 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(topping.id)}
                                    onCheckedChange={(checked) => {
                                      const currentToppings = field.value || [];
                                      if (checked) {
                                        field.onChange([
                                          ...currentToppings,
                                          topping.id,
                                        ]);
                                      } else {
                                        field.onChange(
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

        {/* ドリンクメニューセクション */}
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
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                />
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

        {/* おつまみメニューセクション */}
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
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                />
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

        {/* テーブル情報セクション */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-[#8C2D18] border-b pb-2">
            テーブル情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 座席選択のセレクトボックス */}
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
