import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stageList: []
  },
  mutations: {
    pushStageList(state, stageInfo) {
      state.stageList.push(stageInfo);
    },
    modifyStageList(state, stageInfo, idx) {
      state.stageList.splice(idx, 1, stageInfo);
    }
  },
  actions: {
    stageList({ commit }, stageInfo) {
      const existStageIndex = this.state.stageList.findIndex(item => item.stage === stageInfo.stage);

      if(existStageIndex < 0) {
        const copyObject = JSON.parse(JSON.stringify(stageInfo));

        commit('pushStageList', copyObject);
      } else {
        const copyObject = JSON.parse(JSON.stringify(stageInfo));
        
        commit('modifyStageList', copyObject, existStageIndex);
      }
    },
  },
  getters: {
    getStageList: state => {
      return state.stageList
    },
    getStage: state => idx => {
      return state.stageList[idx];
    }
  }
})
