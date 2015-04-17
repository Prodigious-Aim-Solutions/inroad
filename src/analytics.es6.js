export class Analytics {
  constructor() {
    var self = this;
    if(ga) {
      $(document).on('destinationList:add', (e, id, type) => { self.event('destinationList', 'add', `${id}:${type}`, 1); });
      $(document).on('destinationList:save', (e) => { self.event('destinationList', 'save', 'list', 1); });
      $(document).on('destinationList:directions', (e, loc) => { self.event('destinationList', 'directions', loc, 1); });
      $(document).on('destinationLists:load',(e) => { self.event('destinationLists', 'load', 'list', 1); });
      $(document).on('badge:earned',(e, type, level) => { self.event('badge', 'earned', `${type}:${level}`, 1); });
      $(document).on('checkin:complete',(e, type, id) => { self.event('checkin', 'complete', `${type}:${id}`, 1); });
      $(document).on('register:complete', (e) => { self.event('register', 'complete', 'user', 1); });
      $(document).on('signin:complete', (e) => { self.event('signin', 'complete', 'user', 1); });
      $(document).on('signin:session', (e) => { self.event('signin', 'session', 'user', 1); });
      $(document).on('info:clicked', (e, type, id) => { self.event('info', 'clicked', `${type}:${id}`, 1); });
      $(document).on('location:set', (e, loc) => { self.event('location', 'set', loc, 1); });      
    }
  }
  
  event(cat, action, label, value) {
    ga('send', 'event', cat, action, label, value);
  }
}