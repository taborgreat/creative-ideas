

//plan
FINSIHED rework server endpoints to receive json, whether it be single node or a whole branch 
FINISHED insert and pull node data from mongo db 
clean up all backend code that is unneeded/ SIMPLIFY from creation phase

FINSIHEDmake goal endpoint

FINISHED add second db to record value transfer: node id of node calling for trade, node id of donating node, values traded from calling node, values traded from donating node
        log in db for list of transactions and then also make the changes on the main database shifting values over from proper version to version
        keep in mind if you transfer $20 from wealth branch to workout branch, its $20 of value send to workout branch, and $20 lost from wealth, but you also want to see relationship how
        much hrs and other values in wealth it cost to get that $20 so you/llm can dictate value transfers and their worth to other branches. may be inherit with both branches and transactions json seeing how the value trade was worth

build function/endpoint to insert a node between 2 nodes transferring parent id's respectively
handle trading nodes either being set to null or to parent id in transactions collection when a node is deleted that was involved

FINISHED manage kinks with value endpoints
FINISHED manage kinks with status endpoint- make sure children inherit status. combine set status and complete endpoints

FINISHED make it so when you prestige it adds ================== in mark up with prestige data and a reflection field (reflection prompt pops up when prestiging, or you can add later)
FINISHED Add goal properties attached to values and way to track (whether they be quanitifable or yes/no)
FINISHED determine an efficient system to value inherit- thinking all values get summed into the root exchange node, or if created from a diff type node get summed to it
rework front end into react and components- ALL FRONT END NOW IS PLAY AND SHIT

FINISHED flip tree graphics so root is bottom
click title, status, schedule to manage on front end. click version icon next to name to switch between versions
prestige button
FINSIHED value chart is prestige dependenet with global values to side
FINSIHED click + below or next to values to add new value or goal for value
FINSIHED click on value or goal to pull up prompt to delete

DINSIHED AND REMOVED notes jump to prestige lines on current level
FINISHED add ability to upload media to notes

on tree view line color/thickness is correlated to values. colors for values are next to name in value chart. thickness is relative value transfer
top right corner of tree view there is in-progress, trim, and complete check boxes to select certain nodes
FINSIHED click node to go make it have the page view

![Front end initial plan](https://i.imgur.com/xc42Hdy.jpeg)


Each value has name, value, and inheritable bool. If inheritable is true (check mark next to value on front end)
then all children will receive the value like hrs in root. Can be turned off in further generations so it stops if you don’t need to track further 

FINSIHED need to add in goals, global values(toggle version values),), and schedule.schedule I already built just have to move old code into react components 

Node top third of div is selected node
FINISHED Selected node outline

Trim ai objects
Graphic to view
Add them to tree or regenerate 

Tree upside down dirt with root in dirt
Blue sky hackgroynd 

FINISHED Add contributions to everything 

Filter for current gen, all, reflection  in notes

and note
prompt on completion or prestige

Trade db: nodea and nodeb to nodeAsking and nodeAgreeing 

FINISHED AND REMOVED Under schedule add option to show just node or children too
Show version that the node is on schedule 

Invites in db 
User inviting
User receiving
IsToBeOwnrr
isUninviting
Status: pending, accepted, declined 
Root id 

Endpoints create invite
To be contributor, to remove contributors, 
To be owner
Respond

When deleting root ask you are owner and you have contributors. Choose a new person to own
Send contributions when inviting someone, uninviting (whether be forced by owner or self) and changing owner 

+ create first tree 


add ability to send tree to llm with new task and receive branch back from parent id (variable complexity) that you can append to the parent
add ability to send tree to llm and ask questions about it, receiving new perspectives and correlation detection

fix removing nodes and children so it collects all values of children from global values and node being deleted, then subtracts those values from parent nodes to correct values after removing
possibly: make it so statuses skip pass divider nodes and keep propating to children instead of stopping at divider node


FINSIHED
user schema 
id
username passwords.
root nodes[]
contributions[] changes to nodes in db

REMOVED root nodes points to different branches (trees)
FINSIHED in db. users can have own trees, share roots
with others and build togethrr, join in others
trees branches at any part and collaborate
or share values at any time from any node
to any tree 

each node has a type field which is default
but can be used to build custom node branches
and used to share value more carefully
type fields point to js files that control
value field (setting and getting) and has
display windoe space on gui 
connect apis

can either be single node that adds functionality
or a predefined branch (system)

predefined brakches with extra functionality
github branch, crypto wallet branch, 
fitness branch. 
to show in component area and act on values
people create custom branches (for self or
to share/work with community) or nodes
to add functionality for making actions on
tree, graphing data, allowing more sophisticated
value trade between peer nodes,leveling systems, etc

//done
notes/editing notes





//mumble


custom predefined branxh systems with widgets
ex: self-mind-emotions : track values (happiness, fatigue, etc)
then build custom widgets in react to view the data
like an emotional task manager for this

or a brancg that tracks sleep with a sleep graph 

also fubdamental wbility to view node which different
chart types and scale axis (hrs, date) to examine
data


if you make  a debt value, it pulls from the parent where the value was created

objects will only have versioning system if labeled as recurrent, and everytime you prestige
you are marking it completed this cycle,
filling in the values needed (hrs, money, calories, weight in workout, etc)
adding a reflection, and a new goal for next week that ideally is a little harder
(maybe not time wise but value wise in other area showing better efficiency w time)

when you prestige, you will also be asked to reflect. whether you do or not, a dashed line like this
with the most recent notes at the top



Notes:

=========================================================== PRESTIGE 5

Reflection: blah balah bah
notes: blah balh blah 

========================================================== PRESTIGE 4

Reflection: blah blah blah
notes < ------old notes

=========================================================== PRESTIGE 3

for exmaple will be inserted into the note object to help organize

the root node is active and is primarily used to track time spent, and make time goals
time is the root value of the tree, meaning all other values depend on its credit which is why
all branches originate from it. you only get so many hours a day to spend through your root
so having the optimized value exchanges throughout will help grow other values with same amount of time
its all about finding how to use your time to get the most value back by managing your value trades
and creative planning structure, trimming off frictionous or completely offcourse strategies for time

Every node/creative idea must be quantifiable that can be set to a goal to be completed based on inherited values, or must be able to say yes or no if it’s done as a whole.

only unquatifiable ones are the banks/exchanges: the main branches: wealth, self (body/mind), others (people, art, materials)
(the fundamental qyantifuable creativevideas coming out of these should relate to the core idea as much as possible, even if
it starts to require values from other parent branches. this allows you to see the root motivations of your endeavors, and not get lost in the sauce
as they entangle and interconnect. )
	
these unquaitifable serve more as organisers for the children below, and act as "trade" hubs to debt values from branches if needed, and clearly see value exchange.
like a bank, they manage the values for all their users(children), and control  "prices" for value swaps depending
on the value the other bank has or is going for so you can see clearly if trades are fair

ex: self->body->2400 calories/day->requires $20 to buy food, which is debted off the wealth branch.
	youd to be careful not to have your $20 for food coming from wealth branch and debting into the body branch as time for wrking out
        as that would throw off the root value of why youre making $20 and create "floating" branches





from the hub of the main branches you can see what "weeds" are feeding for values from other endeavors
or in others->branches->car->you need to pay insurance you could debt wealth branch,
showing you are losing value from wealth branch to support value on other branch


	
If a quantifiable goal is repetitive and progressive (like weights in a lifting branch) then the branch prestoges each time it is satisfied, with a new goal set 

lets say in the other->material branch i write a main goal (quite stupidly) get a lamborghini
this idea would cross into othr branches instantly, as a major step could be acquire $1000000
this would have to creste a linked idea in the wealth branch, that needs to be satisfied for the
other branch to move forward. weeds/linked ideas are much the same, and can be connected by ref id and treated like a child
of the needy branch while using the values of the giving branch to value exchange.
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


