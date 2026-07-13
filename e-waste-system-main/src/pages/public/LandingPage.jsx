import { Link } from "react-router-dom";
import ecoVideo from "../../assets/videos/eco.mp4";
import ewasteVideo from "../../assets/videos/ewaste.mp4";

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* HERO SECTION */}
      <section className="bg-emerald-600 text-white py-12 md:py-24 px-4 md:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">

          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Responsible E-Waste Recycling Made Simple
            </h1>

            <p className="mt-6 text-base md:text-lg text-emerald-100">
              EcoSync is a digital platform designed to help individuals and organizations
              safely dispose of electronic waste through structured pickup scheduling
              and environmentally responsible recycling.
            </p>

            <div className="mt-10 flex gap-4">
              <Link
                to="/register"
                className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Get Started
              </Link>

              <a
                href="#about"
                className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="mt-10 md:mt-0 max-w-full">
            <video
              src={ecoVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-[500px] rounded-2xl shadow-2xl object-cover"
            />
          </div>

        </div>
      </section>

      {/* ABOUT / CRISIS SECTION */}
      <section id="about" className="bg-emerald-50 py-16 md:py-24 px-4 md:px-20">
        <div className="max-w-6xl mx-auto">

          <div className="bg-white p-6 md:p-12 rounded-3xl shadow-md border border-emerald-100">

            <h2 className="text-3xl font-bold text-gray-900 text-center">
              The Growing E-Waste Crisis
            </h2>

            <p className="mt-8 text-gray-600 text-lg text-center max-w-4xl mx-auto">
              According to the Global E-Waste Monitor 2024, more than 62 million metric tons
              of electronic waste were generated globally. However, only about 22% was formally
              collected and properly recycled.
            </p>

            <p className="mt-6 text-gray-600 text-lg text-center max-w-4xl mx-auto">
              Improper disposal releases hazardous materials such as lead, mercury, and cadmium
              into soil and water systems, posing serious risks to environmental and human health.
            </p>

            <div className="grid md:grid-cols-3 gap-10 mt-16 text-center">

              <div>
                <h3 className="text-4xl font-bold text-emerald-600">62M+</h3>
                <p className="mt-3 text-gray-600">
                  Metric tons of e-waste generated globally, making it one of the fastest-growing waste streams.
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-bold text-emerald-600">22%</h3>
                <p className="mt-3 text-gray-600">
                  Only a small portion is formally recycled, leaving the majority improperly handled.
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-bold text-emerald-600">5x</h3>
                <p className="mt-3 text-gray-600">
                  E-waste is growing five times faster than documented recycling efforts worldwide.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 🔥 MIDDLE VIDEO SECTION WITH MESSAGE (MOVED HERE) */}
      <section className="py-14 md:py-28 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center">

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">
            A Closer Look at E-Waste
          </h2>

          <div className="w-full md:w-[75%] px-2">
            <video
              src={ewasteVideo}
              controls
              className="w-full rounded-3xl shadow-2xl object-cover"
            />
          </div>

        </div>
      </section>

      {/* WHY ECOSYNC */}
      <section className="py-16 md:py-24 px-4 md:px-20 bg-white">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Why Choose EcoSync
          </h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-14 mt-16">

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start p-4 sm:p-6 rounded-2xl hover:bg-gray-50 transition text-center sm:text-left">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-xl text-xl flex-shrink-0">
                📋
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Structured Digital Workflow
                </h3>
                <p className="mt-4 text-gray-600 text-sm">
                  EcoSync provides a transparent request system where users can submit,
                  track, and manage pickup requests in an organized manner.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start p-4 sm:p-6 rounded-2xl hover:bg-gray-50 transition text-center sm:text-left">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-xl text-xl flex-shrink-0">
                🌱
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Environmentally Responsible Disposal
                </h3>
                <p className="mt-4 text-gray-600 text-sm">
                  Devices are directed toward proper recycling processes that reduce landfill waste
                  and environmental contamination.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start p-4 sm:p-6 rounded-2xl hover:bg-gray-50 transition text-center sm:text-left">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-xl text-xl flex-shrink-0">
                🚚
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Convenient Doorstep Pickup
                </h3>
                <p className="mt-4 text-gray-600 text-sm">
                  Users can schedule pickups from their location, eliminating the need
                  to search for disposal centers.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start p-4 sm:p-6 rounded-2xl hover:bg-gray-50 transition text-center sm:text-left">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-xl text-xl flex-shrink-0">
                🔐
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Secure Handling of Devices
                </h3>
                <p className="mt-4 text-gray-600 text-sm">
                  Responsible handling reduces risks associated with improper disposal
                  and potential misuse of electronic components.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16 md:py-24 px-4 md:px-20">
        <div className="max-w-4xl mx-auto">

          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Frequently Asked Questions
          </h2>

          <div className="mt-12 space-y-8">

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-semibold text-gray-900">
                Is my data safe?
              </h4>
              <p className="mt-3 text-gray-600">
                Devices are handled responsibly and processed through structured recycling systems.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-semibold text-gray-900">
                What items can I recycle?
              </h4>
              <p className="mt-3 text-gray-600">
                Laptops, phones, monitors, batteries, printers, and other electronic devices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-semibold text-gray-900">
                Is there a pickup charge?
              </h4>
              <p className="mt-3 text-gray-600">
                Charges may vary depending on device type and pickup location.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-10 md:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

          <div>
            <h3 className="text-lg font-semibold text-white">EcoSync</h3>
            <p className="mt-4 text-sm">
              Smart digital platform for responsible e-waste management.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <p className="text-sm">support@ecosync.com</p>
            <p className="text-sm mt-2">+91 90000 00000</p>
            <p className="text-sm mt-2">India</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><Link to="/register" className="hover:text-white">Get Started</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © 2026 EcoSync. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;