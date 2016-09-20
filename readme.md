## The Long and Short of It

### Background

"The Long and Short of It" is a 3D model of a dress made with Three.js, a JavaScript library that uses WebGL to display animated 3D computer graphics. This will be a part of a larger app that allows the user to design their own dress by selecting "features" and customizing the styles, sizes, colors, fabric, etc of those features.

The model will have the following elements:
1) a menu on the left
2) a dress on the right

### Functionality & MVP  

In this game, the user will be able to:

- [ ] Toggle Fullscreen mode
- [ ] Collapse the menu
- [ ] Choose among three basic colors for the dress
- [ ] Use a slider to control the length of dress
- [ ] See the dress from different angles by moving the mouse
- [ ] Change the distance of the camera by scrolling with the mouse wheel

In addition, this project will include:

- [ ] A production Readme

### Wireframes

This app will consist of a single screen.

![regular view](/lib/docs/wireframes/regular.png)

The menu is collapsable

![collapsed menu](/lib/docs/wireframes/collapsed.png)

The Fullscreen button will take the user to Fullscreen mode where the menu disappears. The user can return to menu view by pressing the esc key.

![full screen view](/lib/docs/wireframes/fullscreen.png)

A detailed view of the controller

![menu](/lib/docs/wireframes/menu-large.png)

### Architecture and Technologies

This project will be implemented with the following technologies:

- Vanilla `JavaScript` for overall structure, game logic, and DOM manipulations
- `Three.js` to set up the scene, camera, and renderer
- `CSS` to style the menu

- `index.html` is the entry file which will also contain the elements of the menu to be styled in `application.css`, as well as the script tag that will display the dress
- `dress.js` is the script will handle the logic for creating the scene, camera, and rendering

### Implementation Timeline

**Day 1**: Follow the Three.js documentation to create 3D animation of a cube to familiarize with how 3D graphics and WebGL work.

**Day 2**: Learn Blender and create a mesh of body for the dress. Render the dress using the Mesh property of Three.js. Make it able to rotate

**Day 3**: Create the menu and make the dress respond to length changes

**Day 4**: Style, and work on bonus features

### Bonus features

There are many features an expansions that can be added.  Some anticipated updates are:

- [ ] Give choices for fabric
- [ ] Toggle wind to show how the fabric responds to movement
- [ ] Menu takes body measurements and scales dress accordingly
- [ ] More styling choices
