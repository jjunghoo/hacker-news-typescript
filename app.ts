type Store = {
  currentPage: number;
  feeds: NewsFeed[];
};

type NewsFeed = {
  id: number;
  comments_count: number;
  url: string;
  time_ago: string;
  points: number;
  title: string;
  read?: boolean;
};

const $container: HTMLElement | null = document.getElementById("root");
const NEWS_URL: string = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL: string = "https://api.hnpwa.com/v0/item/@id.json";
const store: Store = {
  currentPage: 1,
  feeds: [],
};

async function getData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

const makeFeeds = (feeds) => {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }
  return feeds;
};

const updateView = (html) => {
  if ($container !== null) {
    $container.innerHTML = html;
  } else {
    console.error("최상위 컨테이너가 없어 UI를 진행하지 못합니다.");
  }
};

const newsFeed = () => {
  let newsFeed: NewsFeed[] = store.feeds;
  const newsList = [];
  let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                Previous
              </a>
              <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news_feed__}}        
      </div>
    </div>
  `;

  if (newsFeed.length === 0) {
    getData(NEWS_URL).then((data) => {
      newsFeed = store.feeds = makeFeeds(data);

      for (
        let i = (store.currentPage - 1) * 10;
        i < store.currentPage * 10;
        i++
      ) {
        newsList.push(`
        <div class="p-6 ${
          newsFeed[i].read ? "bg-gray-400" : "bg-white"
        } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
          <div class="flex">
            <div class="flex-auto">
              <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
            </div>
            <div class="text-center text-sm">
              <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
                newsFeed[i].comments_count
              }</div>
            </div>
          </div>
          <div class="flex mt-3">
            <div class="grid grid-cols-3 text-sm text-gray-500">
              <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
              <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
              <div><i class="far fa-clock mr-1"></i>${
                newsFeed[i].time_ago
              }</div>
            </div>  
          </div>
        </div>  
      `);
      }

      template = template.replace("{{__news_feed__}}", newsList.join(""));
      template = template.replace(
        "{{__prev_page__}}",
        store.currentPage > 1 ? store.currentPage - 1 : 1
      );
      template = template.replace(
        "{{__next_page__}}",
        store.currentPage + 1 > newsFeed.length / 10
          ? store.currentPage
          : store.currentPage + 1
      );

      updateView(template);
    });
  }

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
      <div class="p-6 ${
        newsFeed[i].read ? "bg-gray-400" : "bg-white"
      } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
              newsFeed[i].comments_count
            }</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
            <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
            <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
          </div>
        </div>
      </div>
    `);
  }

  template = template.replace("{{__news_feed__}}", newsList.join(""));
  template = template.replace(
    "{{__prev_page__}}",
    store.currentPage > 1 ? store.currentPage - 1 : 1
  );
  template = template.replace(
    "{{__next_page__}}",
    store.currentPage + 1 > newsFeed.length / 10
      ? store.currentPage
      : store.currentPage + 1
  );

  updateView(template);
};

const newsDetail = () => {
  const id = location.hash.substring(7);

  getData(CONTENT_URL.replace("@id", id)).then((data) => {
    let template = `
      <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/${store.currentPage}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
          <h2>${data.title}</h2>
          <div class="text-gray-400 h-20">
            ${data.content}
          </div>

          {{__comments__}}

        </div>
      </div>  
    `;

    for (let i = 0; i < store.feeds.length; i++) {
      if (store.feeds[i].id === Number(id)) {
        store.feeds[i].read = true;
        break;
      }
    }

    const makeComments = (comments, called = 0) => {
      const commentString = [];

      for (let i = 0; i < comments.length; i++) {
        commentString.push(`
          <div style="padding-left: ${called * 40}px;" class="mt-4">
            <div class="text-gray-400">
              <i class="fa fa-sort-up mr-2"></i>
              <strong>${comments[i].user}</strong> ${comments[i].time_ago}
            </div>
            <p class="text-gray-700">${comments[i].content}</p>
          </div>
        `);

        if (comments[i].comments.length > 0) {
          commentString.push(makeComments(comments[i].comments, called + 1));
        }
      }
      return commentString.join("");
    };

    updateView(
      template.replace("{{__comments__}}", makeComments(data.comments))
    );
  });
};

const router = () => {
  const routePath = location.hash;

  if (routePath === "") {
    newsFeed();
  } else if (routePath.indexOf("#/page/") >= 0) {
    store.currentPage = Number(location.hash.substring(7));
    console.log(store.currentPage);
    newsFeed();
  } else {
    newsDetail();
  }
};

window.addEventListener("hashchange", router);

router();
