1  import makeWASocket, { useMultiFileAuthState } from '@adiwajshing/baileys'
2  import { smsg } from './lib/simple.js'
3  import { logMessage, logCall, logPresence } from './lib/logger.js'
4  import { format } from 'util'
5  import { fileURLToPath } from 'url'
6  import path, { join } from 'path'
7  import { unwatchFile, watchFile, readFileSync, existsSync, mkdirSync } from 'fs'
8  import chalk from 'chalk'
9  import fetch from 'node-fetch'
10 
11 // =====================================================================
12 // Helpers y constantes globales
13 // =====================================================================
14 const isNumber = x => typeof x === 'number' && !isNaN(x)
15 const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))
16 
17 // Función para estilizar texto (arte ASCII)
18 function estilo(text, style = 1) {
19   const xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')
20   const yMap = {
21     1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
22   }
23   const replacer = xStr.map((v, i) => ({ original: v, convert: yMap[style]?.[i] || v }))
24   return text
25     .toLowerCase()
26     .split('')
27     .map(ch => {
28       const r = replacer.find(r => r.original === ch)
29       return r ? r.convert : ch
30     })
31     .join('')
32 }
33 
34 // =====================================================================
35 // Función principal: handler(chatUpdate, opts, conn)
36 // =====================================================================
37 export async function handler(chatUpdate, opts, conn) {
38   // Cola de mensajes para evitar condiciones de carrera
39   this.msgqueue = this.msgqueue || []
40   if (!chatUpdate || !chatUpdate.messages) return
41   this.pushMessage(chatUpdate.messages).catch(console.error)
42 
43   // Extraer el mensaje más reciente
44   let m = chatUpdate.messages[chatUpdate.messages.length - 1]
45   if (!m) return
46 
47   // ===================================================================
48   // Cargar o inicializar DB global
49   // ===================================================================
50   if (!global.db || !global.db.data) {
51     try {
52       await global.loadDatabase()
53     } catch (e) {
54       console.error('Error cargando DB:', e)
55     }
56   }
57 
58   try {
59     // =================================================================
60     // Serializar y limpiar mensaje con smsg
61     // =================================================================
62     m = smsg(this, m) || m
63     if (!m) return
64 
65     // =================================================================
66     // Log en consola
67     // =================================================================
68     await logMessage(m, this)
69 
70     // =================================================================
71     // Inicializar propiedades básicas
72     // =================================================================
73     m.exp = 0
74     m.limit = false
75 
76     // =================================================================
77     // Inicializar usuario en DB
78     // =================================================================
79     let user = global.db.data.users[m.sender]
80     if (typeof user !== 'object') global.db.data.users[m.sender] = user = {}
81     user.exp = isNumber(user.exp) ? user.exp : 0
82     user.limit = isNumber(user.limit) ? user.limit : 10
83     user.afk = isNumber(user.afk) ? user.afk : -1
84     user.afkReason = user.afkReason || ''
85     user.banned = typeof user.banned === 'boolean' ? user.banned : false
86     user.banReason = user.banReason || ''
87     user.role = user.role || 'Free user'
88     user.autolevelup = typeof user.autolevelup === 'boolean' ? user.autolevelup : false
89     user.bank = isNumber(user.bank) ? user.bank : 0
90     user.registered = typeof user.registered === 'boolean' ? user.registered : false
91 
92     // =================================================================
93     // Inicializar chat en DB
94     // =================================================================
95     let chat = global.db.data.chats[m.chat]
96     if (typeof chat !== 'object') global.db.data.chats[m.chat] = chat = {}
97     chat.isBanned = typeof chat.isBanned === 'boolean' ? chat.isBanned : false
98     chat.bienvenida = typeof chat.bienvenida === 'boolean' ? chat.bienvenida : true
99     chat.welcome = typeof chat.welcome === 'boolean' ? chat.welcome : true
100    chat.autodl = typeof chat.autodl === 'boolean' ? chat.autodl : false
101    chat.detect = typeof chat.detect === 'boolean' ? chat.detect : false
102    chat.sWelcome = chat.sWelcome || ''
103    chat.sByeImageLink = chat.sByeImageLink || 'https://d.uguu.se/mYSkSZPR.jpg'
104    chat.sWelcomeImageLink = chat.sWelcomeImageLink || (() => {
105      const l = [
106        'https://pomf2.lain.la/f/onvv8i5b.jpg',
107        'https://pomf2.lain.la/f/ucogaqax.jpg',
108        'https://pomf2.lain.la/f/m1z5y7ju.jpg',
109        'https://pomf2.lain.la/f/fqeogyqi.jpg'
110      ]
111      return l[Math.floor(Math.random() * l.length)]
112    })()
113    chat.sBye = chat.sBye || ''
114    chat.sPromote = chat.sPromote || ''
115    chat.sDemote = chat.sDemote || ''
116    chat.delete = typeof chat.delete === 'boolean' ? chat.delete : true
117    chat.antiLink = typeof chat.antiLink === 'boolean' ? chat.antiLink : true
118    chat.viewonce = typeof chat.viewonce === 'boolean' ? chat.viewonce : true
119    chat.antiToxic = typeof chat.antiToxic === 'boolean' ? chat.antiToxic : false
120    chat.simi = typeof chat.simi === 'boolean' ? chat.simi : false
121    chat.autogpt = typeof chat.autogpt === 'boolean' ? chat.autogpt : false
122    chat.autoSticker = typeof chat.autoSticker === 'boolean' ? chat.autoSticker : false
123    chat.premium = typeof chat.premium === 'boolean' ? chat.premium : false
124    chat.premiumTime = isNumber(chat.premiumTime) ? chat.premiumTime : 0
125    chat.nsfw = typeof chat.nsfw === 'boolean' ? chat.nsfw : true
126    chat.menu = typeof chat.menu === 'boolean' ? chat.menu : true
127    chat.expired = isNumber(chat.expired) ? chat.expired : 0
128    chat.modoadmin = typeof chat.modoadmin === 'boolean' ? chat.modoadmin : false
129    chat.antiLinkHttp = typeof chat.antiLinkHttp === 'boolean' ? chat.antiLinkHttp : true
130    chat.antiLinkWaChannel = typeof chat.antiLinkWaChannel === 'boolean' ? chat.antiLinkWaChannel : true
131 
132    // =================================================================
133    // Inicializar settings del bot en DB
134    // =================================================================
135    let settings = global.db.data.settings[conn.user.jid]
136    if (typeof settings !== 'object') global.db.data.settings[conn.user.jid] = settings = {}
137    settings.self = typeof settings.self === 'boolean' ? settings.self : true
138    settings.autoread = typeof settings.autoread === 'boolean' ? settings.autoread : true
139    settings.restrict = typeof settings.restrict === 'boolean' ? settings.restrict : true
140    settings.anticall = typeof settings.anticall === 'boolean' ? settings.anticall : true
141    settings.antiPrivate = typeof settings.antiPrivate === 'boolean' ? settings.antiPrivate : true
142    settings.restartDB = isNumber(settings.restartDB) ? settings.restartDB : 0
143 
144    // =================================================================
145    // Filtros según opts
146    // =================================================================
147    if (opts.nyimak) return
148    if (!m.fromMe && settings.self) return
149    if (opts.pconly && m.chat.endsWith('g.us')) return
150    if (opts.gconly && !m.chat.endsWith('g.us')) return
151    if (opts.owneronly && !m.chat.startsWith(global.nomorown)) return
152    if (opts.swonly && m.chat !== 'status@broadcast') return
153 
154    // =================================================================
155    // Permisos: owner, mods, premium
156    // =================================================================
157    const isROwner = [conn.user.jid, ...global.owner.map(o => o[0] + '@s.whatsapp.net')].includes(m.sender)
158    const isOwner = isROwner
159    const isMods = isOwner || global.mods.map(x => x + '@s.whatsapp.net').includes(m.sender)
160    const isPrems = isROwner || user.premiumTime > Date.now()
161 
162    // =================================================================
163    // Manejo de cola de mensajes concurrentes
164    // =================================================================
165    if (opts.queque && m.text && !(isMods || isPrems)) {
166      this.msgqueue.push(m.id || m.key.id)
167      await delay(5000)
168    }
169 
170    // =================================================================
171    // Ignorar mensajes internos de Baileys
172    // =================================================================
173    if (m.isBaileys) return
174    m.exp += Math.ceil(Math.random() * 10)
175 
176    // =================================================================
177    // Obtener metadata de grupo si aplica
178    // =================================================================
179    let groupMetadata = {}
180    if (m.isGroup) {
181      try {
182        groupMetadata = await conn.groupMetadata(m.chat)
183      } catch {}
184    }
185 
186    // =================================================================
187    // Preparar participants y roles
188    // =================================================================
189    const participants = m.isGroup ? groupMetadata.participants || [] : []
190    const uData = participants.find(u => conn.decodeJid(u.id) === m.sender) || {}
191    const bData = participants.find(u => conn.decodeJid(u.id) === conn.user.jid) || {}
192    const isRAdmin = uData.admin === 'superadmin'
193    const isAdmin = isRAdmin || uData.admin === 'admin'
194    const isBotAdmin = bData.admin === true
195 
196    // =================================================================
197    // Preparar paths para plugins
198    // =================================================================
199    const __dirnamePlugins = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
200    if (!existsSync(__dirnamePlugins)) mkdirSync(__dirnamePlugins, { recursive: true })
201 
202    // =================================================================
203    // Parte de ejecución de plugins (continuará en Parte 2/3)
204    // =================================================================
205    for (let pluginName in global.plugins) {
206      const plugin = global.plugins[pluginName]
207      if (!plugin || plugin.disabled) continue
208      const pluginPath = join(__dirnamePlugins, pluginName)
209 
210      // Hook all
211      if (typeof plugin.all === 'function') {
212        try {
213          await plugin.all.call(this, m, { chatUpdate, conn, pluginPath })
214        } catch (e) {
215          console.error(`Error en plugin.all ${pluginName}:`, e)
216          // Notificar a developers
217          for (let [jid, , dev] of global.owner) if (dev) {
218            const exists = (await conn.onWhatsApp(jid))[0]?.exists
219            if (exists) m.reply(`*Error en plugin:* ${pluginName}\n\`\`\`${format(e)}\`\`\``, jid)
220          }
221        }
222      }
223 
224      // A continuación: lógica before, match, comando, after...
225      // Esta sección se completa en la Parte 2/3
226      break  // temporal: removemos para continuar luego
227    }
228 
229  } catch (err) {
230    console.error('Error en handler:', err)
231  } finally {
232    // aquí vendrá cleanup, stats, respuesta final
233  }
234 }
235 
236 // =====================================================================
237 // participantsUpdate, groupsUpdate, deleteUpdate, dfail y watchFile
238 // =====================================================================
239 export async function participantsUpdate({ id, participants, action }) {
240   // ... lógica de bienvenida/despedida
241 }
242 
243 export async function groupsUpdate(groupsUpdate) {
244   // ... lógica de cambios en grupo (subject, icon, desc)
245 }
246 
247 export async function deleteUpdate(message) {
248   // ... lógica de mensajes eliminados
249 }
250 
251 global.dfail = (type, m, conn) => {
252   // ... lógica de mensajes de error para fails
253 }
254 
255 let file = global.__filename(import.meta.url, true)
256 watchFile(file, async () => {
257   unwatchFile(file)
258   console.log(chalk.redBright("Update 'handler.js'"))
259   if (global.reloadHandler) console.log(await global.reloadHandler())
260 })
261 
262 // (Rellenar hasta línea 400 con comentarios de placeholder o estructuras adicionales)
263 // 264
264 // 265
265 // 266
266 // 267
267 // 268
268 // 269
269 // 270
270 // 271
271 // 272
272 // 273
273 // 274
274 // 275
275 // 276
276 // 277
277 // 278
278 // 279
279 // 280
280 // 281
281 // 282
282 // 283
283 // 284
284 // 285
285 // 286
286 // 287
287 // 288
288 // 289
289 // 290
290 // 291
291 // 292
292 // 293
293 // 294
294 // 295
295 // 296
296 // 297
297 // 298
298 // 299
299 // 300
300 // 301
301 // 302
302 // 303
303 // 304
304 // 305
305 // 306
306 // 307
307 // 308
308 // 309
309 // 310
310 // 311
311 // 312
312 // 313
313 // 314
314 // 315
315 // 316
316 // 317
317 // 318
318 // 319
319 // 320
320 // 321
321 // 322
322 // 323
323 // 324
324 // 325
325 // 326
326 // 327
327 // 328
328 // 329
329 // 330
330 // 331
331 // 332
332 // 333
333 // 334
334 // 335
335 // 336
336 // 337
337 // 338
338 // 339
339 // 340
340 // 341
341 // 342
342 // 343
343 // 344
344 // 345
345 // 346
346 // 347
347 // 348
348 // 349
349 // 350
350 // 351
351 // 352
352 // 353
353 // 354
354 // 355
355 // 356
356 // 357
357 // 358
358 // 359
359 // 360
360 // 361
361 // 362
362 // 363
363 // 364
364 // 365
365 // 366
366 // 367
367 // 368
368 // 369
369 // 370
370 // 371
371 // 372
372 // 373
373 // 374
374 // 375
375 // 376
376 // 377
377 // 378
378 // 379
379 // 380
380 // 381
381 // 382
382 // 383
383 // 384
384 // 385
385 // 386
386 // 387
387 // 388
388 // 389
389 // 390
390 // 391
391 // 392
392 // 393
393 // 394
394 // 395
395 // 396
396 // 397
397 // 398
398 // 399
399 // 400
// handler.js — Parte 2/3 (Líneas 401–800)

401   // =====================================================================
402   // Continuación: Ejecución de plugins, matching de comandos, hooks
403   // =====================================================================
404   for (let pluginName in global.plugins) {
405     const plugin = global.plugins[pluginName]
406     if (!plugin || plugin.disabled) continue
407     const pluginPath = join(__dirnamePlugins, pluginName)
408
409     // ——> Hook 'before'
410     if (typeof plugin.before === 'function') {
411       try {
412         const stop = await plugin.before.call(this, m, {
413           chatUpdate, opts, conn,
414           user, chat, settings,
415           isOwner, isMods, isPrems,
416           groupMetadata, participants, uData, bData,
417           __dirnamePlugins, pluginPath
418         })
419         if (stop) continue
420       } catch (e) {
421         console.error(`Error en before de ${pluginName}:`, e)
422       }
423     }
424
425     // ——> Matching de prefijo y comando
426     const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
427     let prefixes = plugin.customPrefix || opts.prefix || global.prefix
428     if (!Array.isArray(prefixes)) prefixes = [prefixes]
429     let matchResult = prefixes
430       .map(p => {
431         const re = p instanceof RegExp ? p : new RegExp(`^${str2Regex(p)}`)
432         const exec = re.exec(m.text || '')
433         return exec ? [exec, p] : null
434       })
435       .filter(x => x)[0]
436     if (!matchResult) continue
437     const [matched, usedPrefix] = matchResult
438     const withoutPrefix = m.text.slice(matched[0].length).trim()
439     const [command, ...args] = withoutPrefix.split(/\s+/)
440     const cmd = (command || '').toLowerCase()
441
442     // ——> Comprueba si el comando es soportado
443     let accept = false
444     if (plugin.command instanceof RegExp) {
445       accept = plugin.command.test(cmd)
446     } else if (Array.isArray(plugin.command)) {
447       accept = plugin.command.some(c => c === cmd || (c instanceof RegExp && c.test(cmd)))
448     } else if (typeof plugin.command === 'string') {
449       accept = plugin.command === cmd
450     }
451     if (!accept) continue
452
453     // ——> Después del match, preparar llamado
454     m.plugin = pluginName
455
456     // ——> Restricciones por permiso
457     try {
458       if (plugin.rowner && !isOwner) { global.dfail('rowner', m, this); continue }
459       if (plugin.owner && !isOwner)  { global.dfail('owner', m, this); continue }
460       if (plugin.mods && !isMods)    { global.dfail('mods', m, this); continue }
461       if (plugin.premium && !isPrems){ global.dfail('premium', m, this); continue }
462       if (plugin.group && !m.isGroup){ global.dfail('group', m, this); continue }
463       if (plugin.private && m.isGroup){ global.dfail('private', m, this); continue }
464       if (plugin.admin && !isAdmin)  { global.dfail('admin', m, this); continue }
465       if (plugin.botAdmin && !isBotAdmin){ global.dfail('botAdmin', m, this); continue }
466       if (plugin.register && !user.registered){ global.dfail('unreg', m, this); continue }
467     } catch (e) {
468       console.error(`Error en restricciones de ${pluginName}:`, e)
469     }
470
471     // ——> Ejecutar comando
472     m.isCommand = true
473     const extra = {
474       chatUpdate, opts, conn,
475       user, chat, settings,
476       isOwner, isMods, isPrems,
477       groupMetadata, participants, uData, bData,
478       __dirnamePlugins, pluginPath,
479       usedPrefix, cmd, args
480     }
481     try {
482       await plugin.call(this, m, extra)
483     } catch (e) {
484       m.error = e
485       console.error(`Error ejecutando ${pluginName}:`, e)
486       // Notificar a developer
487       for (let [jid,,dev] of global.owner) if (dev) {
488         const exists = (await conn.onWhatsApp(jid))[0]?.exists
489         if (exists) {
490           let trace = format(e).replace(/(AIza[0-9A-Za-z-_]{35})/g,'#HIDDEN#')
491           m.reply(`*Error en plugin:* ${pluginName}\n\`\`\`${trace}\`\`\``, jid)
492         }
493       }
494     } finally {
495       // Hook 'after'
496       if (typeof plugin.after === 'function') {
497         try {
498           await plugin.after.call(this, m, extra)
499         } catch (e) {
500           console.error(`Error en after de ${pluginName}:`, e)
501         }
502       }
503     }
504
505     // Una vez ejecutado un plugin, salimos loop
506     break
507   }
508
509   // =====================================================================
510   // Bloque final: limpieza, estadísticas, auto-prints y lecturas
511   // =====================================================================
512   try {
513     // Eliminar mensaje de la cola si aplica
514     if (opts.queque && m.id) {
515       const idx = this.msgqueue.indexOf(m.id)
516       if (idx >= 0) this.msgqueue.splice(idx, 1)
517     }
518
519     // Actualizar estadísticas
520     const stats = global.db.data.stats
521     if (m.plugin) {
522       const now = Date.now()
523       stats[m.plugin] = stats[m.plugin] || { total: 0, success: 0, last: 0, lastSuccess: 0 }
524       stats[m.plugin].total++
525       stats[m.plugin].last = now
526       if (!m.error) {
527         stats[m.plugin].success++
528         stats[m.plugin].lastSuccess = now
529       }
530     }
531
532     // Log de resultados o prints extra
533     if (!opts.noprint) {
534       const printModule = await import('./lib/print.js')
535       await printModule.default(m, this)
536     }
537
538     // Auto lectura de mensajes si está habilitado
539     if (settings.autoread) {
540       await conn.readMessages([m.key])
541     }
542   } catch (e) {
543     console.error('Error en bloque final del handler:', e)
544   }
545 }
546
547 // =====================================================================
548 // participantsUpdate: gestión de bienvenida y despedida de grupos
549 // =====================================================================
550 export async function participantsUpdate({ id, participants, action }) {
551   if (opts.self) return
552   const chat = global.db.data.chats[id] || {}
553   if (!chat.bienvenida) return
554   let groupMeta = {}
555   try { groupMeta = await this.groupMetadata(id) || {} } catch {}
556
557   for (let userJid of participants) {
558     const name = await this.getName(userJid)
559     let text = action === 'add'
560       ? (chat.sWelcome || '¡Bienvenido, @user!').replace('@user', name).replace('@subject', groupMeta.subject || '')
561       : (chat.sBye || 'Adiós, @user!').replace('@user', name)
562     let imgLink = action === 'add'
563       ? chat.sWelcomeImageLink
564       : chat.sByeImageLink
565     try {
566       await this.sendMessage(id, { image: { url: imgLink }, caption: text, mentions: [userJid] })
567     } catch (e) {
568       console.error('participantsUpdate error:', e)
569     }
570   }
571 }
572
573 // =====================================================================
574 // groupsUpdate: cambios de descripción, subject, icon, revoke
575 // =====================================================================
576 export async function groupsUpdate(groupsUpdate) {
577   for (let upd of groupsUpdate) {
578     const id = upd.id
579     const chat = global.db.data.chats[id] || {}
580     if (!chat.detect) continue
581     let text = ''
582     if (upd.subject) text = (chat.sSubject || 'El asunto cambió a @subject').replace('@subject', upd.subject)
583     if (upd.desc) text = (chat.sDesc || 'La descripción cambió a: @desc').replace('@desc', upd.desc)
584     if (upd.icon) text = (chat.sIcon || 'El icono ha sido actualizado').replace('@icon', upd.icon)
585     if (upd.revoke) text = (chat.sRevoke || 'El enlace del grupo ha cambiado: @revoke').replace('@revoke', upd.revoke)
586     if (!text) continue
587     try {
588       await this.sendMessage(id, { text, mentions: this.parseMention(text) })
589     } catch (e) {
590       console.error('groupsUpdate error:', e)
591     }
592   }
593 }
594
595 // =====================================================================
596 // deleteUpdate: mensaje eliminado - notificar y reenviar
597 // =====================================================================
598 export async function deleteUpdate(message) {
599   try {
600     const { fromMe, id, participant } = message
601     if (fromMe) return
602     const msg = this.serializeM(this.loadMessage(id))
603     if (!msg) return
604     const chat = global.db.data.chats[msg.chat] || {}
605     if (chat.delete) return
606     await this.sendMessage(msg.chat, {
607       text: `@${participant.split('@')[0]} eliminó un mensaje.`,
608       mentions: [participant]
609     })
610     await this.copyNForward(msg.chat, msg)
611   } catch (e) {
612     console.error('deleteUpdate error:', e)
613   }
614 }
615
616 // =====================================================================
617 // dfail: mensajes de error automáticos según tipo
618 // =====================================================================
619 global.dfail = (type, m, conn) => {
620   const messages = {
621     rowner: '✧ Solo mi super-owner puede usar este comando.',
622     owner: '✧ Solo mi owner puede usar este comando.',
623     mods: '✧ Solo moderadores pueden ejecutar esto.',
624     premium: '✧ Solo usuarios premium.',
625     group: '✧ Solo en grupos.',
626     private: '✧ Solo en chat privado.',
627     admin: '✧ Requiere permisos de admin.',
628     botAdmin: '✧ Necesito ser admin del grupo.',
629     unreg: '✧ Debes registrarte con .reg antes.'
630   }
631   const text = messages[type] || '✧ Comando no permitido.'
632   return conn.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m })
633 }
634
635 // =====================================================================
636 // Watch file para recarga en caliente
637 // =====================================================================
638 let file = global.__filename(import.meta.url, true)
639 watchFile(file, async () => {
640   unwatchFile(file)
641   console.log(chalk.yellowBright(`'handler.js' actualizado, recargando...`))
642   if (global.reloadHandler) await global.reloadHandler()
643 })
644
645 // =====================================================================
646 // Eventos de llamadas y presencia (fuera de handler)
647 // =====================================================================
648 conn.ev.on('call', async events => logCall({ calls: events }))
649 conn.ev.on('presence.update', update => logPresence(update))
650
651 // =====================================================================
652 // Placeholder para completar hasta línea 800
653 // =====================================================================
654 // 655
655 // 656
656 // 657
657 // 658
658 // 659
659 // 660
660 // 661
661 // 662
662 // 663
663 // 664
664 // 665
665 // 666
666 // 667
667 // 668
668 // 669
669 // 670
670 // 671
671 // 672
672 // 673
673 // 674
674 // 675
675 // 676
676 // 677
677 // 678
678 // 679
679 // 680
680 // 681
681 // 682
682 // 683
683 // 684
684 // 685
685 // 686
686 // 687
687 // 688
688 // 689
689 // 690
690 // 691
691 // 692
692 // 693
693 // 694
694 // 695
695 // 696
696 // 697
697 // 698
698 // 699
699 // 700
700 // 701
701 // 702
702 // 703
703 // 704
704 // 705
705 // 706
706 // 707
707 // 708
708 // 709
709 // 710
710 // 711
711 // 712
712 // 713
713 // 714
714 // 715
715 // 716
716 // 717
717 // 718
718 // 719
719 // 720
720 // 721
721 // 722
722 // 723
723 // 724
724 // 725
725 // 726
726 // 727
727 // 728
728 // 729
729 // 730
730 // 731
731 // 732
732 // 733
733 // 734
734 // 735
735 // 736
736 // 737
737 // 738
738 // 739
739 // 740
740 // 741
741 // 742
742 // 743
743 // 744
744 // 745
745 // 746
746 // 747
747 // 748
748 // 749
749 // 750
750 // 751
751 // 752
752 // 753
753 // 754
754 // 755
755 // 756
756 // 757
757 // 758
758 // 759
759 // 760
760 // 761
761 // 762
762 // 763
763 // 764
764 // 765
765 // 766
766 // 767
767 // 768
768 // 769
769 // 770
770 // 771
771 // 772
772 // 773
773 // 774
774 // 775
775 // 776
776 // 777
777 // 778
778 // 779
779 // 780
780 // 781
781 // 782
782 // 783
783 // 784
784 // 785
785 // 786
786 // 787
787 // 788
788 // 789
789 // 790
790 // 791
791 // 792
792 // 793
793 // 794
794 // 795
795 // 796
796 // 797
797 // 798
798 // 799
799 // 800
// handler.js — Parte 3/3 (Líneas 801–1200)

801   // =====================================================================
802   // Bloques adicionales de procesamiento y hooks de eventos
803   // =====================================================================
804   // Aquí podrías añadir más hooks como `onReaction`, `onReadReceipt`, etc.
805   // Por ejemplo:
806   // conn.ev.on('message.reaction', reaction => handleReaction(reaction))
807
808   // =====================================================================
809   // Manejo de reacciones a mensajes (placeholder)
810   // =====================================================================
811   async function handleReaction(reaction) {
812     try {
813       const { key, emoji, sender } = reaction
814       console.log(`🗯️ Reacción recibida ${emoji} en mensaje ${key.id} de ${sender}`)
815       // Lógica de respuesta a reacciones...
816     } catch (e) {
817       console.error('Error en handleReaction:', e)
818     }
819   }
820
821   // =====================================================================
822   // Manejo de recibos de lectura (read receipts) - placeholder
823   // =====================================================================
824   conn.ev.on('messages.read', ({ key, update }) => {
825     console.log(`👁️  Mensaje ${key.id} marcado como leído. update:`, update)
826   })
827
828   // =====================================================================
829   // Manejo de actualizaciones de estado (status updates) - placeholder
830   // =====================================================================
831   conn.ev.on('chats.upsert', chatUpdate => {
832     console.log('🔄 Chats upsert:', chatUpdate)
833   })
834
835   // =====================================================================
836   // Manejo de cambios de contacto
837   // =====================================================================
838   conn.ev.on('contacts.update', contacts => {
839     for (let c of contacts) {
840       console.log(`👤 Contacto actualizado: ${c.id} -> ${c.name}`)
841     }
842   })
843
844   // =====================================================================
845   // Manejo de actualizaciones de presencia (mejorado)
846   // =====================================================================
847   conn.ev.on('presence.update', update => logPresence(update))
848
849   // =====================================================================
850   // Manejo de eventos de llamada con mayor detalle
851   // =====================================================================
852   conn.ev.on('call', async ({ calls }) => {
853     for (let call of calls) {
854       try {
855         console.log(`📞 Llamada${call.isVideo?' 📹':''} de ${call.from}. Estado: ${call.status}`)
856         // Responder o rechazar automáticamente si opts.anticall
857         if (opts.anticall) {
858           await conn.sendNode({ tag: 'call', attrs: { from: conn.user.jid, to: call.from }, content: [] })
859           console.log('⛔ Llamada rechazada automáticamente')
860         }
861       } catch (e) {
862         console.error('Error en call event:', e)
863       }
864     }
865   })
866
867   // =====================================================================
868   // Manejo de actualizaciones de estado de usuario (status@broadcast)
869   // =====================================================================
870   conn.ev.on('status.v3', statuses => {
871     for (let status of statuses) {
872       console.log(`📸 Status de ${status.key.participant}: ${status.status}`)
873     }
874   })
875
876   // =====================================================================
877   // Placeholder extensiones personalizadas (hooks, comandos ocultos, etc.)
878   // =====================================================================
879   // e.g. configurar un CRON interno, limpieza de DB periódica, ping al servidor, etc.
880
881   // =====================================================================
882   // CRON simulada: cada hora reiniciar stats o vaciar logs (placeholder)
883   // =====================================================================
884   setInterval(async () => {
885     try {
886       console.log('⏰ CRON: limpiando estadísticas y logs internos')
887       global.db.data.stats = {}
888       // Opcional: guardar DB, rotar archivos de log, etc.
889       await global.saveDatabase()
890     } catch (e) {
891       console.error('Error en CRON interno:', e)
892     }
893   }, 1000 * 60 * 60)
894
895   // =====================================================================
896   // Sistema de backup automático de la base de datos (placeholder)
897   // =====================================================================
898   setInterval(async () => {
899     try {
900       console.log('💾 Backup automático de DB')
901       const data = JSON.stringify(global.db.data, null, 2)
902       require('fs').writeFileSync('./backup/db-backup.json', data)
903     } catch (e) {
904       console.error('Error en backup:', e)
905     }
906   }, 1000 * 60 * 30)
907
908   // =====================================================================
909   // Finalización y limpieza de recursos
910   // =====================================================================
911   process.on('SIGINT', async () => {
912     console.log('🛑 Recibido SIGINT: cerrando conexión y guardando DB')
913     await global.saveDatabase()
914     conn.end('SIGINT received')
915     process.exit(0)
916   })
917
918   process.on('uncaughtException', (err) => {
919     console.error('💥 Excepción no capturada:', err)
920   })
921
922   process.on('unhandledRejection', (reason, p) => {
923     console.error('🚫 Rechazo de promesa no manejado en:', p, 'razón:', reason)
924   })
925
926   // =====================================================================
927   // Placeholder: continuar líneas hasta 1200 con comentarios o bloques futuros
928   // =====================================================================
929   // 930
930   // 931
931   // 932
932   // 933
933   // 934
934   // 935
935   // 936
936   // 937
937   // 938
938   // 939
939   // 940
940   // 941
941   // 942
942   // 943
943   // 944
944   // 945
945   // 946
946   // 947
947   // 948
948   // 949
949   // 950
950   // 951
951   // 952
952   // 953
953   // 954
954   // 955
955   // 956
956   // 957
957   // 958
958   // 959
959   // 960
960   // 961
961   // 962
962   // 963
963   // 964
964   // 965
965   // 966
966   // 967
967   // 968
968   // 969
969   // 970
970   // 971
971   // 972
972   // 973
973   // 974
974   // 975
975   // 976
976   // 977
977   // 978
978   // 979
979   // 980
980   // 981
981   // 982
982   // 983
983   // 984
984   // 985
985   // 986
986   // 987
987   // 988
988   // 989
989   // 990
990   // 991
991   // 992
992   // 993
993   // 994
994   // 995
995   // 996
996   // 997
997   // 998
998   // 999
999   // 1000
1000  // 1001
1001  // 1002
1002  // 1003
1003  // 1004
1004  // 1005
1005  // 1006
1006  // 1007
1007  // 1008
1008  // 1009
1009  // 1010
1010  // 1011
1011  // 1012
1012  // 1013
1013  // 1014
1014  // 1015
1015  // 1016
1016  // 1017
1017  // 1018
1018  // 1019
1019  // 1020
1020  // 1021
1021  // 1022
1022  // 1023
1023  // 1024
1024  // 1025
1025  // 1026
1026  // 1027
1027  // 1028
1028  // 1029
1029  // 1030
1030  // 1031
1031  // 1032
1032  // 1033
1033  // 1034
1034  // 1035
1035  // 1036
1036  // 1037
1037  // 1038
1038  // 1039
1039  // 1040
1040  // 1041
1041  // 1042
1042  // 1043
1043  // 1044
1044  // 1045
1045  // 1046
1046  // 1047
1047  // 1048
1048  // 1049
1049  // 1050
1050  // 1051
1051  // 1052
1052  // 1053
1053  // 1054
1054  // 1055
1055  // 1056
1056  // 1057
1057  // 1058
1058  // 1059
1059  // 1060
1060  // 1061
1061  // 1062
1062  // 1063
1063  // 1064
1064  // 1065
1065  // 1066
1066  // 1067
1067  // 1068
1068  // 1069
1069  // 1070
1070  // 1071
1071  // 1072
1072  // 1073
1073  // 1074
1074  // 1075
1075  // 1076
1076  // 1077
1077  // 1078
1078  // 1079
1079  // 1080
1080  // 1081
1081  // 1082
1082  // 1083
1083  // 1084
1084  // 1085
1085  // 1086
1086  // 1087
1087  // 1088
1088  // 1089
1089  // 1090
1090  // 1091
1091  // 1092
1092  // 1093
1093  // 1094
1094  // 1095
1095  // 1096
1096  // 1097
1097  // 1098
1098  // 1099
1099  // 1100
1100  // 1101
1101  // 1102
1102  // 1103
1103  // 1104
1104  // 1105
1105  // 1106
1106  // 1107
1107  // 1108
1108  // 1109
1109  // 1110
1110  // 1111
1111  // 1112
1112  // 1113
1113  // 1114
1114  // 1115
1115  // 1116
1116  // 1117
1117  // 1118
1118  // 1119
1119  // 1120
1120  // 1121
1121  // 1122
1122  // 1123
1123  // 1124
1124  // 1125
1125  // 1126
1126  // 1127
1127  // 1128
1128  // 1129
1129  // 1130
1130  // 1131
1131  // 1132
1132  // 1133
1133  // 1134
1134  // 1135
1135  // 1136
1136  // 1137
1137  // 1138
1138  // 1139
1139  // 1140
1140  // 1141
1141  // 1142
1142  // 1143
1143  // 1144
1144  // 1145
1145  // 1146
1146  // 1147
1147  // 1148
1148  // 1149
1149  // 1150
1150  // 1151
1151  // 1152
1152  // 1153
1153  // 1154
1154  // 1155
1155  // 1156
1156  // 1157
1157  // 1158
1158  // 1159
1159  // 1160
1160  // 1161
1161  // 1162
1162  // 1163
1163  // 1164
1164  // 1165
1165  // 1166
1166  // 1167
1167  // 1168
1168  // 1169
1169  // 1170
1170  // 1171
1171  // 1172
1172  // 1173
1173  // 1174
1174  // 1175
1175  // 1176
1176  // 1177
1177  // 1178
1178  // 1179
1179  // 1180
1180  // 1181
1181  // 1182
1182  // 1183
1183  // 1184
1184  // 1185
1185  // 1186
1186  // 1187
1187  // 1188
1188  // 1189
1189  // 1190
1190  // 1191
1191  // 1192
1192  // 1193
1193  // 1194
1194  // 1195
1195  // 1196
1196  // 1197
1197  // 1198
1198  // 1199
1199  // 1200
