

function Company() {

    return (
        <div className="mt-12 border-t border-purple-200/70 pt-8 text-center dark:border-white/10">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            &copy; {new Date().getFullYear()} Zentry. All rights reserved.
          </p>
        </div>
    );
}

export default Company
