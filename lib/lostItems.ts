import { supabase } from "./supabase"

export interface LostItem {
  id?: string
  name: string
  found_location: string
  storage_location: string
  found_date: Date
  expiration_date: Date
  status: "unclaimed" | "claimed"
  image_url?: string
  description?: string
}

export async function addLostItem(item: Omit<LostItem, "id">, imageFile?: File): Promise<string> {
  let imageUrl = ""
  if (imageFile) {
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const { data, error } = await supabase.storage.from("lost-items-images").upload(fileName, imageFile)

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("lost-items-images").getPublicUrl(fileName)

    imageUrl = publicUrl
  }

  const { data, error } = await supabase
    .from("lost_items")
    .insert({ ...item, image_url: imageUrl })
    .select()

  if (error) throw error
  return data[0].id
}

export async function getLostItems(): Promise<LostItem[]> {
  const { data, error } = await supabase.from("lost_items").select("*").order("found_date", { ascending: false })

  if (error) throw error
  return data.map((item) => ({
    ...item,
    found_date: new Date(item.found_date),
    expiration_date: new Date(item.expiration_date),
  }))
}

export async function updateLostItemStatus(id: string, status: "unclaimed" | "claimed"): Promise<void> {
  const { error } = await supabase.from("lost_items").update({ status }).eq("id", id)

  if (error) throw error
}

export async function deleteLostItem(id: string): Promise<void> {
  // まず、アイテムの情報を取得
  const { data: item, error: fetchError } = await supabase.from("lost_items").select("image_url").eq("id", id).single()

  if (fetchError) throw fetchError

  // データベースからアイテムを削除
  const { error: deleteError } = await supabase.from("lost_items").delete().eq("id", id)

  if (deleteError) throw deleteError

  // 関連する画像がある場合、Storageから削除
  if (item?.image_url) {
    const imagePath = item.image_url.split("/").pop() // URLからファイル名を抽出
    const { error: storageError } = await supabase.storage.from("lost-items-images").remove([imagePath])

    if (storageError) {
      console.error("Failed to delete image from storage:", storageError)
      // 画像の削除に失敗してもアイテムは削除されているため、エラーはスローしない
    }
  }
}

