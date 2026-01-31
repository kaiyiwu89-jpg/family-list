'use client';

import { useEffect, useState } from 'react';

type Category = '家务' | '宝宝' | '采购' | '其他';
type Priority = '高' | '中' | '低';

interface List {
    id: string;
    name: string;
}

interface FamilyItem {
    id: number;
    title: string;
    listId: string;
    category: Category;
    priority: Priority;
    completed: boolean;
}

const LISTS: List[] = [
    { id: 'walmart', name: 'Walmart' },
    { id: 'costco', name: 'Costco' },
];

const CATEGORY_OPTIONS: Category[] = ['宝宝', '家务', '采购', '其他'];
const FILTER_OPTIONS: (Category | '全部')[] = ['全部', ...CATEGORY_OPTIONS];

const STORAGE_KEY = 'family-list-items';

export default function FamilyListPage() {
    const [lists] = useState<List[]>(LISTS);
    const [activeListId, setActiveListId] = useState<string>('walmart');

    const [items, setItems] = useState<FamilyItem[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState<Category>('其他');
    const [activeCategory, setActiveCategory] =
        useState<Category | '全部'>('全部');

    // 初始化
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch {
                setItems([]);
            }
        } else {
            // 首次示例数据（按清单分）
            setItems([
                {
                    id: 1,
                    title: '买尿不湿',
                    listId: 'walmart',
                    category: '宝宝',
                    priority: '高',
                    completed: false,
                },
                {
                    id: 2,
                    title: '酸奶',
                    listId: 'walmart',
                    category: '采购',
                    priority: '中',
                    completed: false,
                },
                {
                    id: 3,
                    title: '鸡蛋',
                    listId: 'costco',
                    category: '采购',
                    priority: '中',
                    completed: false,
                },
            ]);
        }
    }, []);

    // 自动保存
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const toggleItem = (id: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, completed: !item.completed }
                    : item
            )
        );
    };

    const addItem = () => {
        if (!newTitle.trim()) return;

        const newItem: FamilyItem = {
            id: Date.now(),
            title: newTitle.trim(),
            listId: activeListId,   // 👈 关键：归属当前清单
            category: newCategory,
            priority: '中',
            completed: false,
        };

        setItems(prev => [newItem, ...prev]);
        setNewTitle('');
        setNewCategory('其他');
    };

    // 先按清单过滤，再按分类
    const visibleItems = items.filter(item => {
        if (item.listId !== activeListId) return false;
        if (activeCategory === '全部') return true;
        return item.category === activeCategory;
    });

    const activeListName =
        lists.find(l => l.id === activeListId)?.name ?? '';

    return (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                🏠 家庭清单
            </h1>

            {/* 清单切换 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {lists.map(list => (
                    <button
                        key={list.id}
                        onClick={() => setActiveListId(list.id)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 16,
                            border: '1px solid #ccc',
                            cursor: 'pointer',
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
                            cursor: 'pointer',
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
                    type="text"
                    placeholder={`添加到 ${activeListName}...`}
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    style={{
                        flex: 1,
                        padding: 8,
                        fontSize: 14,
                        border: '1px solid #ccc',
                        borderRadius: 4,
                    }}
                />

                <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as Category)}
                    style={{
                        padding: 8,
                        fontSize: 14,
                        border: '1px solid #ccc',
                        borderRadius: 4,
                    }}
                >
                    {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <button
                    onClick={addItem}
                    style={{
                        padding: '8px 12px',
                        fontSize: 14,
                        cursor: 'pointer',
                    }}
                >
                    ➕ 添加
                </button>
            </div>

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
                            onChange={() => toggleItem(item.id)}
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

                            <small style={{ color: '#666' }}>
                                {item.category} · 优先级 {item.priority}
                            </small>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
