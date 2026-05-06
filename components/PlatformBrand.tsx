import PlatformLogo from "./PlatformLogo";

type PlatformBrandProps = {
  className?: string;
  logoClassName?: string;
  text?: string;
  textClassName?: string;
  priority?: boolean;
};

function PlatformBrand({
  className = "flex items-center gap-0.5",
  logoClassName,
  text = "Zentry",
  textClassName = "text-2xl font-bold text-purple-600 dark:text-purple-400",
  priority = false,
}: PlatformBrandProps) {
  return (
    <span className={className}>
      <PlatformLogo className={logoClassName} priority={priority} />
      <span className={`-ml-1 ${textClassName}`}>{text}</span>
    </span>
  );
}

export default PlatformBrand;
