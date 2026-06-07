# Phase 2: Unified Search

## Objective
Implement search that returns results from both guides and forum posts.

## Tasks

### 2.1 Update Home.tsx Search Logic
**File**: `src/pages/Home.tsx`

Modify `handleSearch` to search both guides and forum posts:

```tsx
const handleSearch = useCallback(async (query: string) => {
  if (!query.trim()) {
    setSearchResults(null);
    return;
  }
  setSearching(true);
  try {
    const [guides, posts] = await Promise.all([
      guidesApi.list({ search: query.trim() }),
      forumApi.list({ search: query.trim() }),
    ]);
    
    const combinedResults = [
      ...guides.map(g => ({ ...g, type: 'guide' })),
      ...posts.map(p => ({ ...p, type: 'forum' })),
    ];
    setSearchResults(combinedResults);
  } catch (e) {
    console.error('Search failed:', e);
  } finally {
    setSearching(false);
  }
}, []);
```

### 2.2 Update Search Results Display
Add type badges and handle navigation:

```tsx
{searchResults.map((result) => (
  <div
    key={result.id}
    onClick={() => {
      if (result.type === 'guide') {
        onNavigate('guide', { guideId: result.id });
      } else {
        onNavigate('forum', { postId: result.id });
      }
    }}
    className="bg-white border border-outline-variant rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-2 mb-1">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
        result.type === 'guide' 
          ? 'bg-primary-container text-on-primary-container'
          : 'bg-secondary-container text-on-secondary-container'
      }`}>
        {result.type === 'guide' ? 'Guide' : 'Forum'}
      </span>
      <span className="text-[10px] font-bold text-secondary uppercase">{result.category}</span>
    </div>
    <h3 className="font-bold text-on-surface mt-1">{result.title}</h3>
    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
      {result.description || result.content}
    </p>
  </div>
))}
```

### 2.3 Add i18n Translations
Add search-related text to all 5 language files.

## Verification
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Search returns guides and forum posts
- [ ] Type badges display correctly
- [ ] Clicking results navigates correctly
