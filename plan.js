//create cycle: idea -> (plan -> work -> learn -> work -> reflect) 
//inside of () = creating, or when time should be tracked


//work is making the physical  change, or making your creative idea(refined into plan) into whats happening physically in reality


//creative idea object
id: ,
idea: ,
dateCreated: ,
noteId: //need to be able to store text and images, body of planning details / tracking progress
needLearnIds: ,

reflections: , //reflection objects are linked to id , wnen you complete idea you add reflection and its combined with notes below
//to be viewable next time you work on project, but you get a clean slate.
parent: , //the parent node, if none it shows at top

timeSpent: ,
inProgress: ,
schedule: //object that holds if floating or scheduled and if scheduled it has reccurency data (if it repeats and how often/when)

//schedule info: if floating no date info, if not floating it can be set to a date just once, or set to repeat at an iteration
/**************************************/

//time component
//collects the total amount of time from all the creative idea objects and daily (defined by a reset time)
//you must reach a certain threshold of time from creative ideas and if you do you go up a level which makes
//24 hrs a little more challenging. the whole goal of app isnt to hit tasks on schedule, but to fulfull
//the amount of time on any creative tasks (like missed tasks) daily as motivation moves around
//shows a circle with time spent so far that day, and you can click on sections to visit creative idea
//shows your level, and you can click to see history of your previous days 
//which is a bunch of small circles side by side on a calender showing all previous circles
//. if you go over the expected time
//for a day then the circle gets darker red from green signalling doing too much. this helps track
//burnout patterns when you do a lot in a day


/**************************************/

//reflection component
//shows all finished creative ideas. you can click and reflect giving yourself notes for next
//time around.  you can also see the all reflections at once. gives time to reflect, and help plan better.
//time spent here goes towards creating, and the create-idea object youre working on

//reflection object (need to signal in creative idea object if reflection is needed for iteration completed)
id: ,
dateCreated: ,
noteId: ,
ideaId: //parent creative idea its attached to.


/**************************************/


//main homepage
//a wall of creative idea objects that have no parents (the main heading)
//two tabs: to-do and completed, if any of the children are uncompleted or come back then the parent is there in todo
//vertical view top down list with each row: title, progress done based on children completed, and time spent so far
//the top section will have all the creative ideas happening today
//the next section will have all the creative iedas happening in the future from most recent to far
//the next section will have all the floating tasks that have no schedule
//the next section will have all the missed scheduled creative ideas which can be made up just the same


//clicking a header from homepage
//brings up a list view of all the children in the tree, with options to add more on each branch.



//keep charles yard maintained 50% 1 hr +
//-mow grass 100% 1hr +   <--------click + to pull up form to create new creative idea as child

//pick weeds +
//-in grass 0% 0hr +
//-in barkdust 0% 0hr +




//if you click on any of the
//children (and parent), it brings up the creative idea object layout, which has the header, timer start/stop/edit time,
//the notes section, 
//previous reflections, scheduling details, and addNeedToLearn Button, 

//this is so you can zoom in and focus on steps in the tree, making each branch the potential
//to be as articulate and full of life (ability to branch out and functional capability)
//as any other for endless planning abilities staying organized

/**************************************/

//need to learn section
//when you are inside of a children after clicking on it from the main tree view after clicking on the header
//from homepage, you can click a green plus which says Add New To Learn. This creates a new object
id:
ideaId:
topic: //what to learn or practice
noteId: 

//there will be a section with a list of all the things you need to practice/learn. when you
//complete the creative idea it was in, then the topic dissapears to promote only learning what you need
//and keeping topics fresh/things you dont know yet/things you can practice.

//when you spent time learning, your time is translated to the CreativeIdea object it falls under.
//this list can be seen as impracticle since it can all be under creativeIdeas, but in times of random
//learning or exploration mood (rather than direct creating or building (learning can be seen as a part of process
//of creating but im breaking it down to building/learning(practicing))) it can be nice to have direct
//ideas to jump to and start learning/practicing.

/**************************************/

//note object will be used for transferring the note or idea bodys around. since the notes can hold
//texts and images, it will be intresting to store

id:
parentId:
data:








