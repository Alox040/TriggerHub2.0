import { Github } from "lucide-react";
import logoImage from "../assets/41208bd857a758438641cb275dc7de957fd9fa9f.png";
import { projectStatus } from "../data/projectStatus";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <img src={logoImage} alt="TriggerHub" className="h-8 object-contain" />
            </div>
            <p className="mb-6 max-w-sm text-sm text-gray-400">
              Public status portal for {projectStatus.productName}. Website content is generated from one centralized
              status contract.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Alox040/Triggerhub"
                target="_blank"
                rel="noreferrer"
                aria-label="TriggerHub GitHub repository"
                className="rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:border-sky-500/30 hover:bg-white/10"
              >
                <Github className="size-4 text-gray-400 transition-colors hover:text-white" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Pages</h3>
            <ul className="space-y-3">
              <li><a href="/" className="text-sm text-gray-400 transition-colors hover:text-white">Home</a></li>
              <li><a href="/access" className="text-sm text-gray-400 transition-colors hover:text-white">Access</a></li>
              <li><a href="/login" className="text-sm text-gray-400 transition-colors hover:text-white">Login</a></li>
              <li><a href="/signup" className="text-sm text-gray-400 transition-colors hover:text-white">Signup</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Product</h3>
            <ul className="space-y-3">
              <li><a href="/dashboard" className="text-sm text-gray-400 transition-colors hover:text-white">Dashboard</a></li>
              <li><a href="/profile" className="text-sm text-gray-400 transition-colors hover:text-white">Profile</a></li>
              <li><a href="/forbidden" className="text-sm text-gray-400 transition-colors hover:text-white">Forbidden</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Community</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/Alox040/Triggerhub"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-sm text-gray-400">Status updated: {projectStatus.updatedAt}</p>
          <div className="flex gap-6">
            <a href="/" className="text-sm text-gray-400 transition-colors hover:text-white">Home</a>
            <a href="/access" className="text-sm text-gray-400 transition-colors hover:text-white">Access</a>
            <a href="/login" className="text-sm text-gray-400 transition-colors hover:text-white">Login</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
