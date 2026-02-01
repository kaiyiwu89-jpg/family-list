'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/** ========= 类型 ========= */

type Category = string;

interface FamilyItem {
    id: number;
    title: string;
    list_id: string;
    category: Category;
    completed: boolean;
}

/** ========= 常量 ========= */

const LISTS = [
    { id: 'walmart', name: 'Walmart' },
    { id: 'costco', name: 'Costco' },
    { id: 'tt', name: 'T&T' },
    { id: 'wishlist', name: '愿望清单' },
];

// 默认分类池（不是写死限制）
const DEFAULT_CATEGORIES = ['必需品', '宝宝', '其他'];

/** ========= 页面 ========= */

export default function FamilyListPage() {
    const [activeListId, setActiveListId] = useState('walmart');
    const [items, setItems] = useState<FamilyItem[]>([]);

    const [newTitle, setNewTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

    const [activeCategory, setActiveCategory] = useState<'全部' | string>('全部');
    const [isLoading, setIsLoading] = useState(true);

    /** ========= 数据 ========= */

    const fetchItems = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setItems(data as FamilyItem[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    /** ========= 分类（动态生成） ========= */

    const categories = Array.from(
        new Set([
            ...DEFAULT_CATEGORIES,
            ...items
                .filter(i => i.list_id === activeListId)
                .map(i => i.category)
                .filter(Boolean),
        ])
    );

    /** ========= 操作 ========= */

    const addItem = async () => {
        if (!newTitle.trim()) return;

        const finalCategory =
            isAddingNewCategory && newCategoryInput.trim()
                ? newCategoryInput.trim()
                : selectedCategory || '其他';

        await supabase.from('todos').insert([
            {
                title: newTitle.trim(),
                list_id: activeListId,
                category: finalCategory,
                completed: false,
            },
        ]);

        setNewTitle('');
        setSelectedCategory('');
        setNewCategoryInput('');
        setIsAddingNewCategory(false);

        fetchItems();
    };

    const toggleCompleted = async (item: FamilyItem) => {
        await supabase
            .from('todos')
            .update({ completed: !item.completed })
            .eq('id', item.id);

        fetchItems();
    };

    const deleteItem = async (id: number) => {
        if (!confirm('确定要删除这个项目吗？')) return;

        await supabase.from('todos').delete().eq('id', id);
        fetchItems();
    };

    /** ========= 过滤 ========= */

    const visibleItems = items.filter(item => {
        if (item.list_id !== activeListId) return false;
        if (activeCategory === '全部') return true;
        return item.category === activeCategory;
    });

    const activeListName =
        LISTS.find(l => l.id === activeListId)?.name ?? '';

    /** ========= UI ========= */

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
                        onClick={() => {
                            setActiveListId(list.id);
                            setActiveCategory('全部');
                        }}
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

            <div style={{ marginBottom: 8, color: '#666' }}>
                当前清单：<strong>{activeListName}</strong>
            </div>

            {/* 分类筛选 */}
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 12,
                    flexWrap: 'wrap',
                }}
            >
                {['全部', ...categories].map(cat => (
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

            {/* 新增区域（方案 3） */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginBottom: 16,
                }}
            >
                <input
                    placeholder={`添加到 ${activeListName}…`}
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    style={{ padding: 8 }}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        disabled={isAddingNewCategory}
                        style={{ flex: 1, padding: 8 }}
                    >
                        <option value="">选择分类</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => setIsAddingNewCategory(v => !v)}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {isAddingNewCategory ? '取消' : '+ 新分类'}
                    </button>
                </div>

                {isAddingNewCategory && (
                    <input
                        placeholder="输入新分类（如：零食 / 冷冻）"
                        value={newCategoryInput}
                        onChange={e => setNewCategoryInput(e.target.value)}
                        style={{ padding: 8 }}
                    />
                )}

                <button
                    onClick={addItem}
                    style={{
                        padding: '8px 12px',
                        background: '#333',
                        color: '#fff',
                        borderRadius: 4,
                    }}
                >
                    添加
                </button>
            </div>

            {/* 列表 */}
            {isLoading ? (
                <p style={{ color: '#999' }}>加载中…</p>
            ) : visibleItems.length === 0 ? (
                <p style={{ color: '#999' }}>暂无项目</p>
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
                            />

                            <div style={{ flex: 1, marginLeft: 8 }}>
                                <div
                                    style={{
                                        textDecoration: item.completed
                                            ? 'line-through'
                                            : 'none',
                                    }}
                                >
                                    {item.title}
                                </div>
                                <small style={{ color: '#666' }}>
                                    {item.category}
                                </small>
                            </div>

                            <button
                                onClick={() => deleteItem(item.id)}
                                style={{ marginLeft: 8 }}
                            >
                                删除
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
