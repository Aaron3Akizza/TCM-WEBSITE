import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Home }               from './pages/Home';
import { About }              from './pages/About';
import { Vision }             from './pages/Vision';
import { WhatWeDo }           from './pages/WhatWeDo';
import { Events }             from './pages/Events';
import { EventDetails }       from './pages/EventDetails';
import { Media }              from './pages/Media';
import { Gallery }            from './pages/Gallery';
import { GetInvolved }        from './pages/GetInvolved';
import { Membership }         from './pages/Membership';
import { Support }            from './pages/Support';
import { Contact }            from './pages/Contact';
import { SignIn }             from './pages/SignIn';
import { SignUp }             from './pages/SignUp';
import { Profile }            from './pages/Profile';
import { Admin }              from './pages/Admin';
import { AdminSponsors }      from './pages/AdminSponsors';
import { AdminPermissions }   from './pages/AdminPermissions';
import { SponsorRegistration } from './pages/SponsorRegistration';
import { AuthCallback }       from './pages/AuthCallback';
import { ResetPassword }      from './pages/ResetPassword';
import { ResendVerification } from './pages/ResendVerification';
import { NotFound }           from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"                    element={<Home />} />
        <Route path="/about"               element={<About />} />
        <Route path="/vision"              element={<Vision />} />
        <Route path="/what-we-do"          element={<WhatWeDo />} />
        <Route path="/events"              element={<Events />} />
        <Route path="/events/:slug"        element={<EventDetails />} />
        <Route path="/media"               element={<Media />} />
        <Route path="/gallery"             element={<Gallery />} />
        <Route path="/get-involved"        element={<GetInvolved />} />
        <Route path="/membership"          element={<Membership />} />
        <Route path="/support"             element={<Support />} />
        <Route path="/contact"             element={<Contact />} />

        {/* ── Auth ── */}
        <Route path="/sign-in"             element={<SignIn />} />
        <Route path="/sign-up"             element={<SignUp />} />
        <Route path="/profile"             element={<Profile />} />
        <Route path="/admin"               element={<Admin />} />
        <Route path="/admin/sponsors"      element={<AdminSponsors />} />
        <Route path="/admin/permissions"   element={<AdminPermissions />} />
        <Route path="/sponsor-registration" element={<SponsorRegistration />} />

        {/* ── Auth flow routes ── */}
        <Route path="/auth/callback"       element={<AuthCallback />} />
        <Route path="/reset-password"      element={<ResetPassword />} />
        <Route path="/resend-verification" element={<ResendVerification />} />

        {/* ── 404 ── */}
        <Route path="*"                    element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
