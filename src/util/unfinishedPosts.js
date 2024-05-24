export const setUnfinishedPost = function (tweets, isFavorite) {
    return localStorage.setItem('unfinished_posts', JSON.stringify({tweets, isFavorite}));
};

export const getUnfinishedPost = function () {
    return JSON.parse(localStorage.getItem('unfinished_posts'));
};

export const removeUnfinishedPost = function () {
   return localStorage.removeItem('unfinished_posts');
};