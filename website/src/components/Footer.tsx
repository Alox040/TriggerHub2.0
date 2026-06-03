import { Github, MessageCircle, Twitter, Youtube } from "lucide-react";
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
              <a href="#" className="rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:border-sky-500/30 hover:bg-white/10">
                <Twitter className="size-4 text-gray-400 transition-colors hover:text-white" />
              </a>
              <a href="#" className="rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:border-sky-500/30 hover:bg-white/10">
                <Youtube className="size-4 text-gray-400 transition-colors hover:text-white" />
              </a>
              <a href="#" className="rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:border-sky-500/30 hover:bg-white/10">
                <MessageCircle className="size-4 text-gray-400 transition-colors hover:text-white" />
              </a>
              <a href="#" className="rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:border-sky-500/30 hover:bg-white/10">
                <Github className="size-4 text-gray-400 transition-colors hover:text-white" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Status</h3>
            <ul className="space-y-3">
              <li><a href="#status" className="text-sm text-gray-400 transition-colors hover:text-white">Available Now</a></li>
              <li><a href="#status" className="text-sm text-gray-400 transition-colors hover:text-white">In Progress</a></li>
              <li><a href="#status" className="text-sm text-gray-400 transition-colors hover:text-white">Planned</a></li>
              <li><a href="#status" className="text-sm text-gray-400 transition-colors hover:text-white">Limitations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Evidence</h3>
            <ul className="space-y-3">
              <li><a href="#evidence" className="text-sm text-gray-400 transition-colors hover:text-white">Proof Points</a></li>
              <li><a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">Architecture</a></li>
              <li><a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">Changelog</a></li>
              <li><a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Community</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">GitHub</a></li>
              <li><a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">Discussions</a></li>
              <li><a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">Updates</a></li>
              <li><a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">Release Notes</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-sm text-gray-400">Status updated: {projectStatus.updatedAt}</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">Terms of Service</a>
            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
