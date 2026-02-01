'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// 1. 类型定义
type Category = '家务' | '宝宝' | '采购' | '其他';
type Priority = '高' | '中' | '低';

interface FamilyItem {
    id: number;
    title: string;
    list_id: string;
    category: Category;
    priority: Priority;
    completed: boolean;
}

const LISTS = [
    { id: 'walmart', name: 'Walmart' },
    { id: 'costco', name: 'Costco' },
];

export default function FamilyListPage() {
    // 2. 状态定义 (补齐之前缺失的 newTitle 等)
    const [activeListId, setActiveListId] = useState<string>('walmart');
    const [items, setItems] = useState<FamilyItem[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState<Category>('其他');
    const [isLoading, setIsLoading] = useState(true);

    // 3. 获取数据（增加了 try-catch 保护，防止页面崩溃）
    const fetchItems = async () => {
        try {
            setIsLoading(true);
            if (!supabase) throw new Error("Supabase 未初始化");

            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setItems(data as FamilyItem[]);
        } catch (err) {
            console.error('连接失败，请检查环境变量:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // 4. 添加功能
    const addItem = async () => {
        if (!newTitle.trim()) return;
        try {
            const { error } = await supabase.from('todos').insert([{
                title: newTitle.trim(),
                list_id: activeListId,
                category: newCategory,
                priority: '中',
                completed: false,
            }]);
            if (error) throw error;
            setNewTitle('');
            fetchItems(); // 刷新列表
        } catch (err) {
            alert("添加失败，请检查网络或数据库配置");
        }
    };

    // 5. 渲染部分 (确保 HTML 结构完整)
    return (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>🏠 家庭清单</h1>

            {/* 清单切换按钮 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {LISTS.map(list => (
                    <button
                        key={list.id}
                        onClick={() => setActiveListId(list.id)}
                        style={{
                            padding: '6px 12px', borderRadius: 16, border: '1px solid #ccc',
                            backgroundColor: activeListId === list.id ? '#333' : '#fff',
                            color: activeListId === list.id ? '#fff' : '#333'
                        }}
                    >
                        {list.name}
                    </button>
                ))}
            </div>

            {/* 输入框区域 - 即使数据库报错也会显示 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="输入新项目..."
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                />
                <button
                    onClick={addItem}
                    style={{ padding: '8px 12px', background: '#333', color: '#fff', borderRadius: 4, cursor: 'pointer' }}
                >
                    添加
                </button>
            </div>

            {/* 列表区域 */}
            <div style={{ minHeight: '100px' }}>
                {isLoading ? (
                    <p style={{ color: '#999' }}>正在连接云端...</p>
                ) : items.length === 0 ? (
                    <p style={{ color: '#999' }}>列表为空</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {items.filter(i => i.list_id === activeListId).map(item => (
                            <li key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                {item.title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}