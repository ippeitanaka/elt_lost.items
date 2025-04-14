"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getLostItems, updateLostItemStatus, deleteLostItem, type LostItem } from "../lib/lostItems"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface LostItemListProps {
  isAdminMode: boolean
}

export default function LostItemList({ isAdminMode }: LostItemListProps) {
  const [items, setItems] = useState<LostItem[]>([])
  const [filter, setFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "unclaimed" | "claimed">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true)
        const fetchedItems = await getLostItems()
        setItems(fetchedItems)
      } catch (err) {
        console.error("Failed to fetch items:", err)
        setError("アイテムの取得に失敗しました。")
      } finally {
        setIsLoading(false)
      }
    }
    fetchItems()
  }, [])

  const handleStatusChange = async (id: string, newStatus: "unclaimed" | "claimed") => {
    if (!isAdminMode) return
    try {
      await updateLostItemStatus(id, newStatus)
      setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
    } catch (err) {
      console.error("Failed to update item status:", err)
      setError("ステータスの更新に失敗しました。")
    }
  }

  const handleDelete = async (id: string) => {
    if (!isAdminMode) return
    if (!window.confirm("本当にこのアイテムを削除しますか？")) return
    try {
      await deleteLostItem(id)
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Failed to delete item:", err)
      setError("アイテムの削除に失敗しました。")
    }
  }

  const filteredItems = items.filter(
    (item) =>
      (item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.found_location.toLowerCase().includes(filter.toLowerCase())) &&
      (statusFilter === "all" || item.status === statusFilter),
  )

  if (isLoading) return <div>読み込み中...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="filter">検索</Label>
          <Input
            id="filter"
            placeholder="アイテム名や発見場所で検索"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="statusFilter">ステータス</Label>
          <Select
            value={statusFilter}
            onValueChange={(value: "all" | "unclaimed" | "claimed") => setStatusFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="ステータスを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="unclaimed">未受取</SelectItem>
              <SelectItem value="claimed">受取済</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ul className="space-y-4">
        {filteredItems.map((item) => (
          <li key={item.id} className="border p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              {isAdminMode && (
                <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id!)} title="削除">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {item.image_url && (
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                className="w-32 h-32 object-cover mb-2 rounded"
              />
            )}
            <p>
              <strong>発見場所:</strong> {item.found_location}
            </p>
            <p>
              <strong>保管場所:</strong> {item.storage_location}
            </p>
            <p>
              <strong>発見日時:</strong> {new Date(item.found_date).toLocaleString("ja-JP")}
            </p>
            <p>
              <strong>保管期限:</strong> {new Date(item.expiration_date).toLocaleDateString("ja-JP")}
            </p>
            <p>
              <strong>ステータス:</strong> {item.status === "unclaimed" ? "未受取" : "受取済"}
            </p>
            {item.description && (
              <p>
                <strong>備考:</strong> {item.description}
              </p>
            )}
            {isAdminMode && (
              <Button
                onClick={() => handleStatusChange(item.id!, item.status === "unclaimed" ? "claimed" : "unclaimed")}
                className="mt-2"
              >
                {item.status === "unclaimed" ? "受取済みにする" : "未受取に戻す"}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

