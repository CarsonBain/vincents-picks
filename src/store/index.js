import Vue from "vue";
import Vuex from "vuex";
import * as fb from '@/firebase'
import router from '@/router/index'

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: {
      loggedIn: false,
      userProfile: {},
    },
    movies: [],
    watchList: [],
    seenList: []
  },
  getters: {
    movieExistsInWatchList: (state) => (movieId) => {
     const watchListIds = state.watchList.map(
        (watchItem) => watchItem.movie_id
      );
        return watchListIds.includes(movieId);
    },
    movieExistsInSeenList: (state) => (movieId) => {
      const seenListIds = state.seenList.map(
         (seenItem) => seenItem.movie_id
       );
         return seenListIds.includes(movieId);
     },
    currentUserSubmittedMovie: (state) => (movieId) => {
      const foundMovie = state.movies.find(movie => movie.id === movieId);
      if (foundMovie.submittedUserId === fb.auth.currentUser.uid) {
        return true;
      }
      return false;
    },
    allPicksWithoutSeenMovies: (state, getters) => {
      return state.movies.filter(movie => !getters.movieExistsInSeenList(movie.id))
    }
  },
  mutations: {
    setUserProfile(state, val) {
      state.user.userProfile = val;
    },
    setLoggedIn(state, boolean) {
      state.user.loggedIn = boolean;
    },
    setMovies(state, movies) {
      state.movies = movies;
    },
    setWatchList(state, watchList) {
      state.watchList = watchList;
    },
    setSeenList(state, seenList) {
      state.seenList = seenList;
    }
  },
  actions: {
    async login({ dispatch}, form) {
      // sign user in
      try {
        const { user } = await fb.auth.signInWithEmailAndPassword(form.email, form.password);
        dispatch('fetchUserProfile', user);

      } catch (e) {
        // TODO: better error handling
        alert(e);
      }
    },
    async fetchUserProfile({ commit }, user) {
      // fetch user profile
      try {
        const userProfile = await fb.usersCollection.doc(user.uid).get();
        const userProfileDataWithId = {...userProfile.data(), id: user.uid};
        commit('setUserProfile', userProfileDataWithId);
        commit('setLoggedIn', true);
      } catch(e) {
        alert(e)
      }
    },
    async logout({ commit }) {
      await fb.auth.signOut();
      commit('setUserProfile', {});
      commit('setLoggedIn', false);
      router.push('/login');
    },
    async getWatchList() {
      if (fb.auth.currentUser) {
        fb.watchListsCollection.where('user_id', '==', fb.auth.currentUser.uid).orderBy('created_on', 'desc').onSnapshot(snapshot => {
          let watchList = [];
          snapshot.forEach(doc => {
            let movie = doc.data();
            movie.id = doc.id;
            watchList.push(movie)
          })
          store.commit('setWatchList', watchList)
        })      
      }
    },
    async addMovieToWatchList({ state, dispatch }, movieId) {
      // Dont add the same item to watchlist twice
      if (state.watchList.some(watchItem => watchItem.movie_id === movieId)) {
        return;
      }
      try {
        await fb.watchListsCollection.add({
          user_id : state.user.userProfile.id,
          movie_id: movieId,
          created_on: new Date()
        })
        await dispatch('removeMovieFromSeenList', movieId); 
      } catch(e) {
        alert(e);
      }
    },
    async removeMovieFromWatchList( {state}, movieId) {
      try {
        await state.watchList.forEach(watchItem => {
          if (watchItem.movie_id === movieId) {
            fb.watchListsCollection.doc(watchItem.id).delete();
          }
        })
      } catch(e) {
        alert(e);
      }
    },
    async getSeenList() {
      if (fb.auth.currentUser) {
        fb.seenListsCollection.where('user_id', '==', fb.auth.currentUser.uid).orderBy('created_on', 'desc').onSnapshot(snapshot => {
          let seenList = [];
          snapshot.forEach(doc => {
            let movie = doc.data();
            movie.id = doc.id;
            seenList.push(movie)
          })
          store.commit('setSeenList', seenList)
        })      
      }
    },
    async addMovieToSeenList({ state, dispatch }, movieId) {
      // Dont add the same item to seenList twice
      if (state.seenList.some(seenItem => seenItem.movie_id === movieId)) {
        return;
      }
      try {
        await fb.seenListsCollection.add({
          user_id : state.user.userProfile.id,
          movie_id: movieId,
          created_on: new Date()
        })
        await dispatch('removeMovieFromWatchList', movieId); 
      } catch(e) {
        alert(e);
      }
      
    },
    async removeMovieFromSeenList( {state}, movieId) {
      try {
        await state.seenList.forEach(seenItem => {
          if (seenItem.movie_id === movieId) {
            fb.seenListsCollection.doc(seenItem.id).delete();
          }
        })
      } catch(e) {
        alert(e);
      }
    },
    async addMovie({ state }, movie) {
      try {
        await fb.moviesCollection.add({
          createdOn: new Date(),
          title: movie.title,
          genres: movie.genres,
          backdropPath: movie.backdropPath,
          posterPath: movie.posterPath,
          year: movie.year,
          tmdbId: movie.tmdbId,
          userRating: movie.userRating,
          network: movie.network,
          otherLink: movie.otherLink,
          submittedUserId: fb.auth.currentUser.uid,
          submittedBy: state.user.userProfile.first_name,
          comments: 0,
          likes: 0
        })
      } catch(e) {
        alert(e);
      }
    },
    async deleteMovie({dispatch}, movieId) {
      try {
        await fb.moviesCollection.doc(movieId).delete().then(() => {
          dispatch('removeMovieFromWatchList', movieId); 
        })
      } catch(e) {
        alert(e);
      }
    }
  },
  modules: {},
});

// realtime firebase connection
fb.moviesCollection.orderBy('createdOn', 'desc').onSnapshot(snapshot => {
  let moviesArray = [];

  snapshot.forEach(doc => {
    let movie = doc.data();
    movie.id = doc.id;

    moviesArray.push(movie)
  })
  store.commit('setMovies', moviesArray)
})


export default store;