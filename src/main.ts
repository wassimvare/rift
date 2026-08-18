import '../style.css';
import { Store } from './state/Store.js';
import { InputManager } from './input/InputManager.js';
import { UiController, type UiActions } from './ui/UiController.js';
import { Renderer } from './ui/Renderer.js';
import { Sfx } from './audio/Sfx.js';
import { GameEngine } from './game/GameEngine.js';
import { MarketService } from './economy/MarketService.js';
import { ProgressionService } from './progression/ProgressionService.js';
import { LocalNetworkGateway } from './network/NetworkGateway.js';
import { AISystem } from './game/ai/AISystem.js';
import { qs } from './ui/dom.js';

const store = new Store(localStorage);
const input = new InputManager(() => store.get().settings);
const sfx = new Sfx(() => store.get().settings);
const market = new MarketService(store);
const progression = new ProgressionService(store);
const network = new LocalNetworkGateway();
const ai = new AISystem();

const actions: UiActions = {
  play: () => engine.startMatch(),
  pause: () => engine.pause(),
  restart: () => engine.restart(),
  quit: () => engine.quit(),
  dash: () => engine.dash(),
  pulse: () => engine.pulse(),
  polarity: () => engine.polarity(),
  burst: () => engine.burst(),
  buy: (id) => engine.buy(id),
  selectMode: (mode) => engine.selectMode(mode),
  setting: (key, value) => engine.setting(key, value),
  captureBinding: (action) => engine.captureBinding(action),
  navigate: (view) => engine.navigate(view),
};

const ui = new UiController(actions);
const renderer = new Renderer(qs<HTMLCanvasElement>('#cv'), () => store.get().settings);
const engine = new GameEngine(store, input, ui, renderer, sfx, market, progression, network, ai);

Object.assign(window, { rift: { engine, store } });
