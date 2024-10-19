

Every node/creative idea must be quantifiable that can be set to a goal to be completed based on inherited values, or must be able to say yes or no if it’s done as a whole.

only unquatifiable ones are the root, and the main branches off of it: wealth, self (body/mind), others (people, art, materials)
(the fundamental qyantifuable creativevideas coming out of these should relate to the core idea as much as possible, even if
it starts to require values from other parent branches. this allows you to see the root motivations of your endeavors, and not get lost in the sauce
as they entangle and interconnect. )
	
these unwuaitifable serve more as organisers for the children below, and act as "trade" hubs to debt values from branches if needed
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


vrrsion control idea
Adding version control to your system can significantly improve the ability to track changes, collaborate, and manage revisions in your creative and planning workflow. Here’s how you can incorporate version control into your existing plan:

1. Version Control for the Creative Idea Objects (with Git)

Git is the most common version control system used for software development, but its concepts can be adapted to track changes in your creative ideas. Here’s how:

	•	Commit Changes to Creative Idea Objects: Each creative idea or task could be tracked as a file or entry, where every change (new plans, updates, reflections) can be committed as a new version. Git allows you to commit every update with a description of what has changed.
	•	Example: When you update the noteId or the schedule object in your idea, it can trigger a commit that records the change.
	•	Branching for Alternate Versions: In situations where you explore different ideas or approaches to a task, you can create branches for each approach, test them out, and merge the best one back into the main plan.
	•	Example: You could branch off a particular idea (like branching from main in Git) and explore new concepts without affecting your primary plan.
	•	Revert to Previous States: If an idea or task doesn’t pan out, you can roll back to a previous version.

2. Tracking Changes to Notes and Progress

For each creative idea object that contains notes and progress tracking data, version control would allow you to:

	•	Track Edits: As you refine your plan or add reflections, Git could track these updates over time. This creates a record of every change you’ve made, along with the date and reason (similar to your “reflection” component).
	•	Storing Notes as Markdown Files: Since markdown (.md) files are easy to version control and read, you could store the body of planning details, progress, and reflections in markdown files, with each note having a version history.

3. Version Control for Scheduling and Learning Plans

Scheduling objects (for floating tasks, recurring tasks) and your learning components can also benefit from versioning:

	•	Scheduled Task Versions: When a task’s schedule changes (e.g., from floating to a specific date or when you add recurrence), Git would log that update. This way, you can view when a task was rescheduled and why.
	•	Tracking Learning Progress: You could track not only the creative work but also learning milestones, using commits to log when you’ve completed a topic or added new things to learn.

4. Integration with GitHub for Commits

	•	GitHub Integration: If you integrate this with GitHub, you could link commits directly to your system’s creative idea objects. This would allow you to see a full history of changes to each idea, and potentially link these commits back to relevant issues (if you’re using GitHub Issues or Projects).

Example commit messages:

	•	Added reflection on the progress of the project.
	•	Updated the timeline and rescheduled milestones.
	•	Completed the "Learn" section for creative idea #2.

5. Adding Versioning to Your System’s UI

To make version control intuitive within your system, you could implement features like:

	•	View History: Add an option to view the version history of any creative idea object, showing a timeline of changes (similar to the “commits” view in Git).
	•	Revert Changes: Allow users to revert back to a previous version of a creative idea, note, or learning plan.
	•	Branch Ideas: Allow the user to create “branches” of ideas. They can fork an idea, experiment with new approaches, and then merge the results back into the main project if successful.

6. Git as Backend for Version Control

You can use Git or a similar version control tool as the backend to track and store changes to all aspects of your system. Here’s how it could work:

	•	Git Repository: Every user (or project) can have their own Git repository where all creative ideas, notes, reflections, schedules, and learnings are stored as files (JSON, Markdown, etc.).
	•	Commit Changes: Whenever the user makes changes to any creative idea, the system could automatically commit those changes to the repository.
	•	Push and Pull: If you have multiple users collaborating, they can push and pull changes to a shared repository, allowing for collaborative idea development.
	•	Merging and Conflict Resolution: If two users edit the same idea, Git’s merge and conflict resolution features could be used to decide how to integrate the changes.

7. Custom Version Control System (Optional)

If using Git directly seems too complex for your system, you could build a simplified version control system:

	•	Version Numbers: Each creative idea could be given a version number (e.g., v1.0, v1.1), and each time a change is made, the system would automatically increment the version and store a copy of the old version.
	•	Version History: Store previous versions of creative ideas and allow the user to revert to or compare different versions.
	•	Diffing: Implement a basic “diff” system to show what’s changed between versions, especially useful for text-based components like notes or reflections.

8. Visualizing the Version Control Process

Since you already have a concept of a tree structure for tasks, you can represent the version control visually:

	•	Tree View for Version Control: Much like a Git commit history, you could display a tree view showing how ideas have evolved over time.
	•	Branches and Merges: Visually indicate when a new idea has branched from an existing one, or when multiple ideas merge into a finalized concept.

Summary of Steps to Add Version Control:

	1.	Implement Git as a Backend: Use Git to track changes to creative ideas, notes, reflections, and scheduling data.
	2.	Connect to GitHub (Optional): Integrate GitHub for online collaboration, linking commits, and viewing history through GitHub’s interface.
	3.	UI Enhancements for Version Control: Add features to your system’s UI to view, revert, and branch versions of tasks.
	4.	Automate Commits: Automatically commit changes whenever a creative idea is updated, and link each commit with a detailed message.
	5.	Handle Branching and Merging: Allow users to branch ideas and experiment, then merge their work back into the main project if successful.

By doing this, you can create a system that tracks the full lifecycle of creative ideas, ensures nothing is lost, and allows you to experiment freely without losing the original plan.





