INSERT INTO menu_categories (id, name, sort_order) VALUES
  ('starters','Starters',1),('mains','Mains',2),('sides','Sides',3),('desserts','Desserts',4),('drinks','Drinks',5)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO restaurant_settings (id, timezone, ordering_enabled, reservations_enabled, collection_lead_minutes, delivery_lead_minutes, delivery_fee_cents, delivery_postcodes, reservation_slot_minutes, reservation_capacity, max_party_size)
VALUES ('primary','Europe/Paris',true,true,20,40,390,ARRAY['75001','75002','75003','75004','75005','75006','75007','75008','75015'],30,24,8)
ON CONFLICT (id) DO UPDATE SET timezone=EXCLUDED.timezone, ordering_enabled=EXCLUDED.ordering_enabled, reservations_enabled=EXCLUDED.reservations_enabled,
collection_lead_minutes=EXCLUDED.collection_lead_minutes, delivery_lead_minutes=EXCLUDED.delivery_lead_minutes,
delivery_fee_cents=EXCLUDED.delivery_fee_cents, delivery_postcodes=EXCLUDED.delivery_postcodes,
reservation_slot_minutes=EXCLUDED.reservation_slot_minutes, reservation_capacity=EXCLUDED.reservation_capacity, max_party_size=EXCLUDED.max_party_size;

DELETE FROM opening_hours;
INSERT INTO opening_hours (day_of_week, open_time, close_time, collection_enabled, delivery_enabled, reservations_enabled) VALUES
  (1,'12:00','14:30',true,true,true),(1,'18:00','22:30',true,true,true),
  (2,'12:00','14:30',true,true,true),(2,'18:00','22:30',true,true,true),
  (3,'12:00','14:30',true,true,true),(3,'18:00','22:30',true,true,true),
  (4,'12:00','14:30',true,true,true),(4,'18:00','22:30',true,true,true),
  (5,'12:00','14:30',true,true,true),(5,'18:00','22:30',true,true,true),
  (6,'12:00','22:30',true,true,true),(0,'12:00','22:30',true,true,true);

INSERT INTO menu_items (id,slug,name,description,category_id,price_cents,image,dietary,allergens,popular,recommended,available,sort_order) VALUES
('burrata','smoked-burrata','Smoked burrata','Provençal tomatoes, basil oil, toasted hazelnut and sourdough.','starters',1400,'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=1200&q=85',ARRAY['Vegetarian'],ARRAY['Milk','Gluten','Nuts'],true,false,true,1),
('croquettes','duck-confit-croquettes','Duck confit croquettes','Slow-cooked duck, Dijon mayonnaise and cornichons.','starters',1300,'https://images.unsplash.com/photo-1767974963436-2208b3553561?auto=format&fit=crop&w=1200&q=85',ARRAY[]::text[],ARRAY['Egg','Gluten','Mustard'],false,true,true,2),
('cauliflower','charred-cauliflower','Charred cauliflower','Almond cream, capers, golden raisins and herb crumb.','starters',1200,'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85',ARRAY['Vegan','Gluten-aware'],ARRAY['Nuts'],false,false,true,3),
('chicken','roast-herb-chicken','Roast herb chicken','Free-range chicken, rosemary jus, confit garlic and pommes boulangère.','mains',2500,'/images/dish-2.jpeg',ARRAY['Gluten-aware'],ARRAY['Milk','Celery'],true,false,true,1),
('salmon','miso-glazed-salmon','Miso-glazed salmon','Roasted salmon, crushed new potatoes, spinach and champagne beurre blanc.','mains',2700,'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=85',ARRAY['Gluten-aware'],ARRAY['Fish','Soy','Milk'],false,true,true,2),
('steak','peppercorn-steak-frites','Peppercorn steak frites','Grilled bavette, crisp fries, watercress and green peppercorn sauce.','mains',2900,'/images/dish-4.jpeg',ARRAY['Gluten-aware'],ARRAY['Milk','Mustard'],true,false,true,3),
('risotto','wild-mushroom-risotto','Wild mushroom risotto','Carnaroli rice, woodland mushrooms, aged Comté and parsley oil.','mains',2300,'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=85',ARRAY['Vegetarian','Gluten-aware'],ARRAY['Milk'],false,false,true,4),
('lamb','slow-cooked-lamb-shoulder','Slow-cooked lamb shoulder','White bean cassoulet, preserved lemon and salsa verde.','mains',2800,'/images/dish-1.jpeg',ARRAY['Gluten-aware'],ARRAY['Celery'],false,false,false,5),
('fries','rosemary-fries','Rosemary fries','Fine sea salt and roasted garlic mayonnaise.','sides',600,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=85',ARRAY['Vegetarian'],ARRAY['Egg'],true,false,true,1),
('greens','seasonal-greens','Seasonal greens','Charred greens, lemon and toasted seeds.','sides',700,'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85',ARRAY['Vegan','Gluten-aware'],ARRAY['Sesame'],false,false,true,2),
('fondant','dark-chocolate-fondant','Dark chocolate fondant','Warm Valrhona chocolate cake, sea salt and vanilla crème fraîche.','desserts',1100,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=85',ARRAY['Vegetarian'],ARRAY['Egg','Milk','Gluten'],true,false,true,1),
('pear','poached-pear','Poached pear','Spiced pear, almond praline and oat crème.','desserts',1000,'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=85',ARRAY['Vegan'],ARRAY['Nuts'],false,false,true,2),
('lemonade','house-lemonade','House lemonade','Lemon, thyme and sparkling water. 33cl.','drinks',500,'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=85',ARRAY['Vegan','Gluten-aware'],ARRAY[]::text[],false,false,true,1),
('wine','cotes-du-rhone','Côtes-du-Rhône rouge','Domaine de la Janasse, Rhône. 75cl.','drinks',2900,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=85',ARRAY['Vegan'],ARRAY['Sulphites'],false,false,true,2)
ON CONFLICT (id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,description=EXCLUDED.description,category_id=EXCLUDED.category_id,price_cents=EXCLUDED.price_cents,image=EXCLUDED.image,dietary=EXCLUDED.dietary,allergens=EXCLUDED.allergens,popular=EXCLUDED.popular,recommended=EXCLUDED.recommended,available=EXCLUDED.available,sort_order=EXCLUDED.sort_order;

DELETE FROM modifier_groups;
INSERT INTO modifier_groups (id,menu_item_id,name,required,max_selections,sort_order) VALUES
('chicken-side','chicken','Choose a side',true,1,1),('chicken-extras','chicken','Add something extra',false,2,2),
('steak-cook','steak','How should we cook your steak?',true,1,1),('risotto-finish','risotto','Finish',false,1,1);
INSERT INTO modifier_options (id,group_id,name,price_cents,available,sort_order) VALUES
('potatoes','chicken-side','Pommes boulangère',0,true,1),('greens-side','chicken-side','Charred seasonal greens',0,true,2),('fries-side','chicken-side','Rosemary fries',100,true,3),
('jus','chicken-extras','Extra rosemary jus',200,true,1),('aioli','chicken-extras','Truffle aioli',250,true,2),
('medium-rare','steak-cook','Medium rare',0,true,1),('medium','steak-cook','Medium',0,true,2),('well-done','steak-cook','Well done',0,true,3),
('truffle','risotto-finish','Fresh truffle',600,true,1);
