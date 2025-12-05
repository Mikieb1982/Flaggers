Flag Shaggers

A satirical arcade beat-em-up game built with React and Vite. Stop the gammon army from covering the suburb in flags.

Features

Arcade Action: Classic beat-em-up mechanics with combos and special moves.

Retro Visuals: Custom pixel art rendering on an HTML5 Canvas.

Responsive Controls: * Desktop: Keyboard support.

Mobile/Touch: Virtual on-screen joystick and buttons.

CRT Filter: CRT scanline and curvature effects for an authentic arcade feel.

Controls

Action

Keyboard

Touch / Mobile

Move

Arrow Keys

Virtual Joystick (Left)

Jump

Space

Blue Button

Attack

Z

Green Button

Run Locally

Install dependencies:

npm install


Start the development server:

npm run dev


Open in browser:
Visit http://localhost:3000 (or the port shown in your terminal).

Deployment

Option 1: Firebase Hosting (Recommended)

Since you are using Firebase, this is the standard deployment method.

Install Firebase CLI:

npm install -g firebase-tools


Login and Initialize:

firebase login
firebase init hosting


Public directory: dist

Configure as single-page app: Yes

Overwrite index.html: No

Build and Deploy:

npm run build
firebase deploy


Option 2: Vercel

Push your code to a GitHub repository.

Import the project into Vercel.

Vercel will detect the Vite settings automatically.

Click Deploy.

Tech Stack

Framework: React 19 + TypeScript

Build Tool: Vite

Styling: Tailwind CSS

Rendering: HTML5 Canvas
