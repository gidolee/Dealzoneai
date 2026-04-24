export default function Footer(): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-logo" aria-label="Dealzone">
            DZ
          </span>
          <div>
            <strong>Dealzone</strong>
            <p>Exclusive discounts from leading brands, tailored to your shopping intent.</p>
          </div>
        </div>

        <div className="footer-columns">
          <section>
            <h4>Categories</h4>
            <a href="/deals">Fashion</a>
            <a href="/deals">Beauty</a>
            <a href="/deals">Electronics</a>
            <a href="/deals">Travel</a>
          </section>

          <section>
            <h4>Members</h4>
            <a href="/login">Sign In</a>
            <a href="/login">Create Account</a>
            <a href="/deals">Trending Deals</a>
            <a href="/deals">Saved Offers</a>
          </section>

          <section>
            <h4>Company</h4>
            <a href="/merchant">Merchant Console</a>
            <a href="mailto:partnerships@dealzone.app">Partnerships</a>
            <a href="mailto:careers@dealzone.app">Careers</a>
            <a href="mailto:hello@dealzone.app">Contact</a>
          </section>

          <section>
            <h4>Support & Legal</h4>
            <a href="mailto:support@dealzone.app">Help Center</a>
            <a href="mailto:support@dealzone.app?subject=Accessibility">Accessibility</a>
            <a href="mailto:legal@dealzone.app?subject=Privacy%20Policy">Privacy</a>
            <a href="mailto:legal@dealzone.app?subject=Terms%20of%20Use">Terms</a>
          </section>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© {year} Dealzone. All rights reserved.</small>
        <small>United Kingdom | English</small>
      </div>
    </footer>
  );
}
