-- Sample User Profiles
INSERT INTO user_profiles (id, username, display_name, default_author_name, default_author_handle, email_notifications, dark_mode, auto_save_drafts, custom_handles, favorite_categories, custom_templates, created_at, updated_at)
VALUES
  ('user1', 'techbro1', 'Tech Enthusiast', 'Startup Guru', '@startupwizard', true, true, true, 
    '[{"name": "Startup Mode", "handle": "@startupguru"}, {"name": "Tech Mode", "handle": "@techenthusiast"}]',
    '["startups", "aiMl", "crypto"]',
    '[
      {
        "name": "Startup Success",
        "content": "Just raised ${{amount}}M at a ${{valuation}}B valuation! 🚀\nKey metrics:\n- {{metric1}}\n- {{metric2}}\n- {{metric3}}\nNext milestone: {{milestone}}\n#startup #funding",
        "variables": ["amount", "valuation", "metric1", "metric2", "metric3", "milestone"]
      },
      {
        "name": "Tech Stack Flex",
        "content": "Built a {{product}} using:\n- {{tech1}}\n- {{tech2}}\n- {{tech3}}\nScaled to {{users}} users in just {{time}}! 💪\n#tech #engineering",
        "variables": ["product", "tech1", "tech2", "tech3", "users", "time"]
      },
      {
        "name": "AI Breakthrough",
        "content": "🤖 Our AI model just achieved:\n- {{metric1}} accuracy\n- {{metric2}} inference time\n- {{metric3}} efficiency\n\nPrevious SOTA: {{previous}}\nOur results: {{current}}\n\nGame changing for {{industry}} 🔥\n#ai #ml",
        "variables": ["metric1", "metric2", "metric3", "previous", "current", "industry"]
      },
      {
        "name": "Crypto Update",
        "content": "Just deployed our smart contract on {{chain}} 🔗\n\n💎 Features:\n- {{feature1}}\n- {{feature2}}\n- {{feature3}}\n\nGas optimization: {{savings}}%\nTVL target: ${{tvl}}M\n\n🧵 on why this is huge...",
        "variables": ["chain", "feature1", "feature2", "feature3", "savings", "tvl"]
      },
      {
        "name": "Weekend Build",
        "content": "Built {{project}} in just one weekend 🚀\n\nTech stack:\n{{stack}}\n\nFeatures:\n- {{feature1}}\n- {{feature2}}\n- {{feature3}}\n\nOpen sourcing soon! Star the repo ⭐️\n#buildinpublic",
        "variables": ["project", "stack", "feature1", "feature2", "feature3"]
      },
      {
        "name": "Growth Metrics",
        "content": "📈 Month {{month}} metrics:\n\nMRR: ${{mrr}}k (+{{mrrGrowth}}%)\nUsers: {{users}}k (+{{userGrowth}}%)\nCAC: ${{cac}}\nLTV: ${{ltv}}\n\nBurning {{runway}} months of runway left 🔥\n#startupmetrics",
        "variables": ["month", "mrr", "mrrGrowth", "users", "userGrowth", "cac", "ltv", "runway"]
      },
      {
        "name": "Tech Hot Take",
        "content": "🔥 Hot take on {{technology}}:\n\nEveryone: {{commonBelief}}\n\nReality: {{reality}}\n\nWhy?\n1. {{reason1}}\n2. {{reason2}}\n3. {{reason3}}\n\n🧵 Controversial but true...",
        "variables": ["technology", "commonBelief", "reality", "reason1", "reason2", "reason3"]
      },
      {
        "name": "Founder Advice",
        "content": "Advice I wish I had before starting {{company}} 🧵\n\n1. {{advice1}}\n2. {{advice2}}\n3. {{advice3}}\n4. {{advice4}}\n5. {{advice5}}\n\nCost me {{cost}}k to learn this\n\nLike & RT to save another founder 🙏",
        "variables": ["company", "advice1", "advice2", "advice3", "advice4", "advice5", "cost"]
      }
    ]',
    NOW(), NOW()),
    
  ('user2', 'hustler99', 'Hustle King', 'Grindset Master', '@hustleking', true, false, true,
    '[{"name": "Hustle Mode", "handle": "@hustleking"}, {"name": "Mentor Mode", "handle": "@mentorpro"}]',
    '["hustle", "broCulture", "startups"]',
    '[
      {
        "name": "Daily Hustle",
        "content": "5:00 AM: {{activity1}}\n6:00 AM: {{activity2}}\n7:00 AM: {{activity3}}\nWhile you sleep, I grind. 😤💪\n#hustle #grindset",
        "variables": ["activity1", "activity2", "activity3"]
      },
      {
        "name": "Success Story",
        "content": "From {{startingPoint}} to {{achievement}} in {{timeframe}}.\nThe secret?\n- {{habit1}}\n- {{habit2}}\n- {{habit3}}\nDMs open for mentorship 🔥",
        "variables": ["startingPoint", "achievement", "timeframe", "habit1", "habit2", "habit3"]
      },
      {
        "name": "Sigma Rules",
        "content": "SIGMA RULE #{{ruleNumber}}:\n\n❌ {{wrongThing}}\n✅ {{rightThing}}\n\nBetas: {{betaBehavior}}\nSigmas: {{sigmaBehavior}}\n\n#sigmamindset #grindset",
        "variables": ["ruleNumber", "wrongThing", "rightThing", "betaBehavior", "sigmaBehavior"]
      },
      {
        "name": "Money Mindset",
        "content": "How I made ${{amount}}K in {{timeframe}}:\n\n1. {{strategy1}}\n2. {{strategy2}}\n3. {{strategy3}}\n\nMindset tip: {{mindsetTip}}\n\nLike + Follow for more 🔥",
        "variables": ["amount", "timeframe", "strategy1", "strategy2", "strategy3", "mindsetTip"]
      },
      {
        "name": "Motivation",
        "content": "They said:\n\"{{negativeFeedback}}\"\n\nMe now:\n- {{achievement1}}\n- {{achievement2}}\n- {{achievement3}}\n\nStay hungry 😤\n#motivation",
        "variables": ["negativeFeedback", "achievement1", "achievement2", "achievement3"]
      },
      {
        "name": "Network Worth",
        "content": "Your network = your net worth 📈\n\nHow I built a {{networkSize}}k+ network:\n\n1. {{strategy1}}\n2. {{strategy2}}\n3. {{strategy3}}\n\nResult: {{outcome}}\n\nWant more tips? Drop a 🤝",
        "variables": ["networkSize", "strategy1", "strategy2", "strategy3", "outcome"]
      },
      {
        "name": "Book Summary",
        "content": "Just finished reading '{{book}}' by {{author}} 📚\n\nKey lessons:\n1. {{lesson1}}\n2. {{lesson2}}\n3. {{lesson3}}\n\nMost underrated quote:\n\"{{quote}}\"\n\nMust read for {{audience}} 💯",
        "variables": ["book", "author", "lesson1", "lesson2", "lesson3", "quote", "audience"]
      },
      {
        "name": "Side Hustle",
        "content": "Started a {{business}} with ${{investment}}\n\nMonth 1: ${{revenue1}}\nMonth 2: ${{revenue2}}\nMonth 3: ${{revenue3}}\n\nKey to success: {{key}}\n\nNever too late to start 🚀",
        "variables": ["business", "investment", "revenue1", "revenue2", "revenue3", "key"]
      }
    ]',
    NOW(), NOW()),
    
  ('user3', 'iitian_coder', 'IIT Grad', 'Campus Legend', '@iitcoder', true, true, true,
    '[{"name": "College Mode", "handle": "@iitcoder"}, {"name": "Pro Mode", "handle": "@techlead"}]',
    '["iitIim", "aiMl", "startups"]',
    '[
      {
        "name": "Placement Flex",
        "content": "Rejected {{company1}}, {{company2}}, {{company3}} to join {{chosenCompany}} as {{role}}!\nPackage: {{ctc}} LPA 🔥\n#placement #iit",
        "variables": ["company1", "company2", "company3", "chosenCompany", "role", "ctc"]
      },
      {
        "name": "Coding Achievement",
        "content": "Solved {{problems}} LC problems\nRank {{rank}} on CodeForces\nWon {{hackathons}} hackathons\nBuilt {{projects}} projects\n#coding #tech",
        "variables": ["problems", "rank", "hackathons", "projects"]
      },
      {
        "name": "Campus Life",
        "content": "Day in the life at {{college}}:\n\n{{time1}}: {{activity1}}\n{{time2}}: {{activity2}}\n{{time3}}: {{activity3}}\n\nCollege life = best life 🎓\n#iit #college",
        "variables": ["college", "time1", "activity1", "time2", "activity2", "time3", "activity3"]
      },
      {
        "name": "Interview Experience",
        "content": "Interview experience at {{company}} 🎯\n\nRounds:\n1. {{round1}}\n2. {{round2}}\n3. {{round3}}\n\nKey topics: {{topics}}\n\nVerdict: {{result}} ✨\n#interviews",
        "variables": ["company", "round1", "round2", "round3", "topics", "result"]
      },
      {
        "name": "Startup Journey",
        "content": "From {{college}} to founding {{startup}} 🚀\n\nJourney:\n- {{milestone1}}\n- {{milestone2}}\n- {{milestone3}}\n\nLearnings: {{learnings}}\n\n#entrepreneurship",
        "variables": ["college", "startup", "milestone1", "milestone2", "milestone3", "learnings"]
      },
      {
        "name": "Competitive Programming",
        "content": "How I cracked {{contest}} 🏆\n\nRank: {{rank}}/{{total}}\nTime: {{time}} minutes\nProblems solved: {{solved}}/{{total_problems}}\n\nKey to solving {{hardestProblem}}: {{solution}}\n\n#cp #coding",
        "variables": ["contest", "rank", "total", "time", "solved", "total_problems", "hardestProblem", "solution"]
      },
      {
        "name": "Internship Diaries",
        "content": "Week {{week}} at {{company}} internship 👨‍💻\n\nWorking on: {{project}}\nTech used: {{tech}}\nLearnt: {{learning}}\nMentor feedback: {{feedback}}\n\nIntern life = best life 🎯\n#internship",
        "variables": ["week", "company", "project", "tech", "learning", "feedback"]
      },
      {
        "name": "Research Paper",
        "content": "Our paper '{{title}}' got accepted at {{conference}} 📑\n\nKey contributions:\n1. {{contribution1}}\n2. {{contribution2}}\n3. {{contribution3}}\n\nImpact: {{impact}}\n\n#research #academia",
        "variables": ["title", "conference", "contribution1", "contribution2", "contribution3", "impact"]
      }
    ]',
    NOW(), NOW());

-- Sample Posts
INSERT INTO posts (id, user_id, content, author_name, author_handle, toxicity_level, categories, special_mode, is_favorite, engagement_score, created_at, metadata)
VALUES
  ('post1', 'user1', 'Just deployed our MVP using GPT-4 API and already got 100 waitlist signups in 2 hours! 🚀 Building in public = best marketing strategy. Who needs a marketing team when you have Twitter? 😤 #buildinpublic #saas', 
    'Startup Guru', '@startupwizard', 'Low', ARRAY['startups', 'aiMl'], 'hype_mode', true, 89, NOW(),
    '{"hashtags": ["buildinpublic", "saas"], "best_time_to_post": "10:00 AM", "estimated_reach": 5000, "thread_length": 1}'),
    
  ('post2', 'user2', 'Reject modern dating 👎\nEmbrace the grindset 💪\nMade my first million at 25\nStarted 3 companies\nSold 2\nYou're watching Netflix, I'm watching market trends\n#sigmamindset #hustle', 
    'Grindset Master', '@hustleking', 'Medium', ARRAY['hustle', 'broCulture'], 'sigma_mode', true, 95, NOW(),
    '{"hashtags": ["sigmamindset", "hustle"], "best_time_to_post": "6:00 AM", "estimated_reach": 10000, "thread_length": 1}'),
    
  ('post3', 'user3', 'Rejected FAANG offers (45 LPA) to join this pre-seed startup (15 LPA + 2% equity) because:\n1. Faster growth\n2. Direct CEO mentorship\n3. Unlimited coconut water\n4. Bean bags > Office chairs\nThoughts? 🤔 #iit #startup', 
    'Campus Legend', '@iitcoder', 'High', ARRAY['iitIim', 'startups'], 'flex_mode', false, 92, NOW(),
    '{"hashtags": ["iit", "startup"], "best_time_to_post": "9:00 PM", "estimated_reach": 8000, "thread_length": 1}'),
    
  ('post4', 'user1', 'Our AI can now:\n- Write Twitter threads\n- Generate LinkedIn posts\n- Create viral hooks\n- Predict engagement\n\nAnd we built it in just 48 hours! 🤯\n\nDrop a 🔥 if you want early access!\n#ai #startup', 
    'Tech Enthusiast', '@techenthusiast', 'Low', ARRAY['aiMl', 'startups'], 'tech_mode', true, 88, NOW(),
    '{"hashtags": ["ai", "startup"], "best_time_to_post": "2:00 PM", "estimated_reach": 7000, "thread_length": 1}'),
    
  ('post5', 'user2', '5:00 AM: Cold shower 🚿\n6:00 AM: Meditation 🧘‍♂️\n7:00 AM: Gym 💪\n8:00 AM: Reading 📚\n9:00 AM: Building empire 👑\n\nYou: Still sleeping 😴\n\nWe are not the same.\n#grindset #hustle', 
    'Hustle King', '@hustleking', 'High', ARRAY['hustle', 'broCulture'], 'sigma_mode', true, 97, NOW(),
    '{"hashtags": ["grindset", "hustle"], "best_time_to_post": "5:00 AM", "estimated_reach": 12000, "thread_length": 1}');

-- Sample Analytics
INSERT INTO analytics (id, user_id, post_id, views, likes, retweets, replies, engagement_rate, best_performing_time, created_at)
VALUES
  ('analytics1', 'user1', 'post1', 5000, 250, 100, 45, 7.9, '10:00 AM', NOW()),
  ('analytics2', 'user2', 'post2', 10000, 500, 200, 80, 8.5, '6:00 AM', NOW()),
  ('analytics3', 'user3', 'post3', 8000, 400, 150, 120, 8.2, '9:00 PM', NOW()),
  ('analytics4', 'user1', 'post4', 7000, 350, 120, 60, 7.8, '2:00 PM', NOW()),
  ('analytics5', 'user2', 'post5', 12000, 600, 250, 100, 8.7, '5:00 AM', NOW()); 