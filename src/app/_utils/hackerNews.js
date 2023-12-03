/** Hacker Newsの人気・最新の記事500件の記事IDを取得する */
export async function getTopStories() {
    // (1)
    return fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
      next: { revalidate: 60 }, // (2) 1分経過するとキャッシュを破棄する
    }).then(
      (res) => res.json()
    );
}

/** 記事の詳細データを取得する */
export async function getItem(id) {
    return fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
      (res) => res.json()
    );
}