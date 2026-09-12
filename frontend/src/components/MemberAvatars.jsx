const colors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-pink-500", "bg-yellow-500", "bg-red-500", "bg-indigo-500",
];

function getColor(id) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return colors[sum % colors.length];
}

function getInitials(name) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function MemberAvatars({ members }) {
  return (
    <div className="flex -space-x-2">
      {members.map((member) => (
        <div
          key={member._id}
          title={`${member.name} (${member.email})`}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white ${getColor(member._id)}`}
        >
          {getInitials(member.name)}
        </div>
      ))}
    </div>
  );
}

export default MemberAvatars;