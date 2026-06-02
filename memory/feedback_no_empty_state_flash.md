---
name: feedback_no_empty_state_flash
description: Never show an empty state before data loads — always show skeleton from the first render using a state variable, not isFetching or a ref
metadata:
  type: feedback
---

Always use a `isLoading` **state variable** (not `isFetching`, not a ref) to gate skeleton vs empty state when integrating any new API.

**Why:** RTK Query does not set `isFetching = true` synchronously on mount — there is one render between the component mounting and the query dispatching. During that frame, `isFetching = false` and `data` is empty, which makes empty-state conditions true and causes a visible flash. Refs have the same problem: both the reset and fetch effects run before the next render, so by render time the ref is already `true` even though `isFetching` is still `false`.

**How to apply:** For every new page or component that fetches data on mount:

### Pattern A — lazy query with pagination (activity feed, left drawer tabs)
```js
const [isLoading, setIsLoading] = useState(true);

// Reset isLoading whenever the key params change (tab, search, etc.)
useEffect(() => {
  setIsLoading(true);
  setData([]);
  setPage(1);
}, [tab, searchQuery]);

// Clear only after real data arrives
useEffect(() => {
  if (isFetching || !apiData) return;
  setData(apiData.items);
  setIsLoading(false);
}, [apiData, isFetching]);

// Render
if (isLoading) return <SkeletonList />;
if (data.length === 0) return <EmptyState />;
return <List data={data} />;
```

### Pattern B — simple lazy query, single fetch (interests, summary)
```js
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetchData().finally(() => setIsLoading(false));
}, [fetchData]);

if (isLoading || isFetching) return <Skeleton />;
if (!data) return <EmptyState />;
return <Content data={data} />;
```

### Pattern C — non-lazy query, room switch (home-view messages)
```js
const [isLoadingMessages, setIsLoadingMessages] = useState(false);

const handleRoomSelect = (room) => {
  setIsLoadingMessages(true); // batched with setLocalPosts([])
  setLocalPosts([]);
  ...
};

// Clear when page-1 data arrives
useEffect(() => {
  if (!query.isSuccess || query.isFetching) return;
  if (page === 1) setIsLoadingMessages(false);
  setLocalPosts(normalize(query.data));
}, [query.data, query.isSuccess, query.isFetching]);

// Render
{isLoadingMessages ? <Skeleton /> : localPosts.length === 0 ? <EmptyState /> : <Posts />}
```

**Never** use `isFetching && data.length === 0` as the skeleton condition — it misses the first render frame.
**Never** use a ref to track "has fetched once" — refs mutate before the next render fires.
