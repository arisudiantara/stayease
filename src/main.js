// Bootstrap aplikasi StayEase.

import './style.css';
import { load } from './store.js';
import { initNavigasi, renderKatalog } from './ui.js';

let kamar = load();

initNavigasi();
renderKatalog(kamar);
