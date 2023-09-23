import {SceneView} from "/backbone/view/views/scene.view.js";
import {ProgressView} from "/backbone/view/views/progress.view.js";
import {StoreView} from "/backbone/view/views/store.view.js";
import {GuideView} from "/backbone/view/views/guide.view.js";

window.vent = _.extend({}, Backbone.Events)
const guide = new GuideView()
const store = new StoreView(data)
const progress = new ProgressView()
const scene = new SceneView()





