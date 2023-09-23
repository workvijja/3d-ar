import {SceneView} from "/backbone/view/views/scene.view.js";
import {ProgressView} from "/backbone/view/views/progress.view.js";
import {StoreView} from "/backbone/view/views/store.view.js";

window.vent = _.extend({}, Backbone.Events)
// vent.on("cloth:clicked", () => {console.log("cloth clicked")})
// vent.once("scene:created", () => {})
// const overlay = new OverlayView()
const store = new StoreView(data)
const progress = new ProgressView()
const scene = new SceneView()





