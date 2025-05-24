"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addLostItem } from "../lib/lostItems"
import { useAuth } from "../contexts/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

export default function LostItemForm() {
  const { user } = useAuth()
  const [image, setImage] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    found_location: "",
    storage_location: "",
    found_date: "",
    expiration_date: "",
    status: "unclaimed" as "unclaimed" | "claimed",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // 認証状態を確認
      if (!user) {
        throw new Error("ログインが必要です。管理者としてログインしてください。")
      }

      // 必須項目の確認
      if (
        !formData.name ||
        !formData.found_location ||
        !formData.storage_location ||
        !formData.found_date ||
        !formData.expiration_date
      ) {
        throw new Error("必須項目を全て入力してください。")
      }

      console.log("Submitting with user:", user.email)
      console.log("Form data:", formData)

      const result = await addLostItem(
        {
          ...formData,
          found_date: new Date(formData.found_date),
          expiration_date: new Date(formData.expiration_date),
        },
        image || undefined,
      )

      setSuccess("忘れ物を登録しました")
      // フォームをリセット
      setFormData({
        name: "",
        found_location: "",
        storage_location: "",
        found_date: "",
        expiration_date: "",
        status: "unclaimed",
        description: "",
      })
      setImage(null)
    } catch (error) {
      console.error("登録エラー:", error)
      let errorMessage = "登録に失敗しました。"

      if (error instanceof Error) {
        if (error.message.includes("row-level security policy")) {
          errorMessage = "データベースのアクセス権限エラーです。RLSポリシーを確認してください。"
        } else if (error.message.includes("JWT")) {
          errorMessage = "認証エラーです。再度ログインしてください。"
        } else {
          errorMessage = error.message
        }
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error)
      }

      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ログインしていない場合の表示
  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>忘れ物を登録するには管理者としてログインしてください。</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>ログイン中: {user.email}</AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="image">写真</Label>
          <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
          {image && (
            <img
              src={URL.createObjectURL(image) || "/placeholder.svg"}
              alt="アップロードされた画像"
              className="mt-2 max-w-xs"
            />
          )}
        </div>
        <div>
          <Label htmlFor="name">アイテム名</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="例：水筒"
            required
          />
        </div>
        <div>
          <Label htmlFor="found_location">発見場所</Label>
          <Input
            id="found_location"
            name="found_location"
            value={formData.found_location}
            onChange={handleInputChange}
            placeholder="例：教室"
            required
          />
        </div>
        <div>
          <Label htmlFor="storage_location">保管場所</Label>
          <Input
            id="storage_location"
            name="storage_location"
            value={formData.storage_location}
            onChange={handleInputChange}
            placeholder="例：職員室"
            required
          />
        </div>
        <div>
          <Label htmlFor="found_date">発見日時</Label>
          <Input
            id="found_date"
            name="found_date"
            type="datetime-local"
            value={formData.found_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="expiration_date">保管期限</Label>
          <Input
            id="expiration_date"
            name="expiration_date"
            type="date"
            value={formData.expiration_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">ステータス</Label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(value: "unclaimed" | "claimed") => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="ステータスを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unclaimed">未受取</SelectItem>
              <SelectItem value="claimed">受取済</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="description">備考</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="その他の情報があれば入力してください"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "登録中..." : "登録"}
        </Button>
      </form>
    </div>
  )
}
