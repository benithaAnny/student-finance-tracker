Student Finance Tracker
A web app that helps students track income, expenses, and budgets.
Built with vanilla HTML, CSS, and JavaScript no frameworks, no libraries.

 Live Demo
Watch Demo Video:https://youtu.be/AidSGj1wCAM

Features


Add Records

You fill in the description, amount, type (expense or income), category, and date. Hit Add Record and it saves instantly.

Edit Records

Click Edit on any record and a full form drops in below it with all the fields already filled. Change what you want, hit Save.

Delete Records

Click Delete on any record and it's gone immediately.

Budget Target

You set a number as your spending limit. As you add expenses it tracks how much you've spent and how much is left. If you go over it turns red and warns you out loud for screen readers.

Stats

Shows your total records, total income, total expenses, your balance, and which category you spend the most on.

Last 7 Days Chart

A bar chart that shows your daily spending for the past week. Taller bar means more spent that day. Updates every time you add a record.

Search

Type anything in the search box and it filters your records live as you type. Supports regex for advanced searching.

Import and Export

Export saves all your records as a JSON file to your computer. Import lets you load that file back in.

Dark Mode

Switch between light and dark theme from the Settings menu. It remembers your choice next time you open the app.

Responsive

Works on phone, tablet, and desktop. The layout adjusts automatically at three screen sizes.

Accessibility

Has a skip link, keyboard navigation, and ARIA live regions so screen readers announce budget alerts automatically.


 Tech Stack

HTML5
CSS3
JavaScript 
localStorage for data persistence


Project Structure
index.html+ css
scripts/
  app.js
  ui.js
  state.js
  storage.js
  validator.js
  search.js
  scrolltop.js