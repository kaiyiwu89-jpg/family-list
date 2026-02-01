'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

const CATEGORY_OPTIONS: Category[] = ['宝宝', '家务', '采购', '其他'];
const FILTER_OPTIONS: (Category | '全部')[] = ['全部', ...CATEGORY_OPTIONS];

export default function FamilyListPage() {
    const [activeListId, setActiveListId] = useState('walmart');
    const [items, setItems] = useState<FamilyItem[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState<Category>('其他');
    const [activeCategory, setActiveCategory] =
        useState<Category | '全部'>('全部');
    const [isLoading, setIsLoading] = useState(true);

    const fetchItems = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setItems(data as FamilyItem[]);
        } catch (err) {
            console.error('加载失败:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const addItem = async () => {
        if (!newTitle.trim()) return;

        const { error } = await supabase.from('todos').insert([
            {
                title: newTitle.trim(),
                list_id: activeListId,
                category: newCategory,
                priority: '中',
                completed: false,
            },
        ]);

        if (!error) {
            setNewTitle('');
            setNewCategory('其他');
            fetchItems();
        }
    };

    const toggleCompleted = async (item: FamilyItem) => {
        await supabase
            .from('todos')
            .update({ completed: !item.completed })
            .eq('id', item.id);

        fetchItems();
    };

    const visibleItems = items.filter(item => {
        if (item.list_id !== activeListId) return false;
        if (activeCategory === '全部') return true;
        return item.category === activeCategory;
    });

    return (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>
                🛒 购物清单
            </h1>

            {/* 清单切换 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {LISTS.map(list => (
                    <button
                        key={list.id}
                        onClick={() => setActiveListId(list.id)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 16,
                            border: '1px solid #ccc',
                            backgroundColor:
                                activeListId === list.id ? '#333' : '#fff',
                            color:
                                activeListId === list.id ? '#fff' : '#333',
                        }}
                    >
                        {list.name}
                    </button>
                ))}
            </div>

            {/* 分类筛选 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {FILTER_OPTIONS.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '4px 10px',
                            fontSize: 13,
                            borderRadius: 16,
                            border: '1px solid #ccc',
                            backgroundColor:
                                activeCategory === cat ? '#333' : '#fff',
                            color:
                                activeCategory === cat ? '#fff' : '#333',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 新增 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="添加商品..."
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />

                <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as Category)}
                    style={{ padding: 8, borderRadius: 4 }}
                >
                    {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <button
                    onClick={addItem}
                    style={{ padding: '8px 12px', background: '#333', color: '#fff', borderRadius: 4 }}
                >
                    添加
                </button>
            </div>

            {/* 列表 */}
            {isLoading ? (
                <p style={{ color: '#999' }}>正在加载...</p>
            ) : visibleItems.length === 0 ? (
                <p style={{ color: '#999' }}>暂无内容</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {visibleItems.map(item => (
                        <li
                            key={item.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid #eee',
                                opacity: item.completed ? 0.5 : 1,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => toggleCompleted(item)}
                                style={{ marginRight: 12 }}
                            />

                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        textDecoration: item.completed ? 'line-through' : 'none',
                                    }}
                                >
                                    {item.title}
                                </div>
                                <small style={{ color: '#666' }}>{item.category}</small>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
